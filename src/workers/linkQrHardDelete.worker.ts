import { Worker, Job } from "bullmq";
import redis from "../infrastructure/configs/redis.config.js";
import URL from "../models/url.model.js";
import QRCode from "../models/qrCode.model.js";
import Visit from "../models/visit.model.js";
import QRScan from "../models/qrScan.model.js";
import qrAssetCleanupQueue from "../infrastructure/queues/qrAssetCleanup.queue.js";
import type { RetentionCleanupJob } from "../shared/types/queue.types.js";
import logger from "../infrastructure/configs/logger.config.js";

const LINK_QR_RETENTION_DAYS = 90;

const linkQrHardDeleteWorker = new Worker<RetentionCleanupJob>("linkQrHardDeleteQueue", async (job: Job<RetentionCleanupJob>): Promise<void> => {
    const cutoff = new Date(Date.now() - LINK_QR_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const expiredUrls = await URL.find({ deletedAt: { $ne: null, $lte: cutoff } });

    for (const url of expiredUrls) {
      await Visit.deleteMany({ linkId: url._id });
      await URL.deleteOne({ _id: url._id });
    }

    const expiredQrs = await QRCode.find({ deletedAt: { $ne: null, $lte: cutoff } });

    for (const qr of expiredQrs) {
      await QRScan.deleteMany({ qrId: qr._id });

      if (qr.cloudinaryPublicId) {
        await qrAssetCleanupQueue.add("cleanup-qr-asset", { cloudinaryPublicId: qr.cloudinaryPublicId });
      }

      await QRCode.deleteOne({ _id: qr._id });
    }

    logger.info( { jobId: job.id, urlsHardDeleted: expiredUrls.length, qrsHardDeleted: expiredQrs.length },
      "Retention window elapsed — soft-deleted links/QR codes permanently removed"
    );
  },
  {
    connection: redis,
  }
);

linkQrHardDeleteWorker.on("failed", (job, error) => {
  logger.error({ jobId: job?.id, err: error }, "Link/QR hard-delete job failed after retries");
});

export default linkQrHardDeleteWorker;