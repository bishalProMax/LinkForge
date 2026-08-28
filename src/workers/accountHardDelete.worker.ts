import { Worker, Job } from "bullmq";
import redis from "../infrastructure/configs/redis.config.js";
import User from "../models/user.model.js";
import URL from "../models/url.model.js";
import QRCode from "../models/qrCode.model.js";
import { deleteVisitsByLinkId } from "../modules/url/visit.repository.js";
import { deleteQRScansByQrId } from "../modules/qr/qrScan.repository.js";
import qrAssetCleanupQueue from "../infrastructure/queues/qrAssetCleanup.queue.js";
import { revokeAllUserSessions } from "../shared/services/jwt.service.js";
import type { RetentionCleanupJob } from "../shared/types/queue.types.js";
import logger from "../infrastructure/configs/logger.config.js";

const ACCOUNT_DELETION_GRACE_DAYS = 30;

const accountHardDeleteWorker = new Worker<RetentionCleanupJob>( "accountHardDeleteQueue", async (job: Job<RetentionCleanupJob>): Promise<void> => {
    const cutoff = new Date(Date.now() - ACCOUNT_DELETION_GRACE_DAYS * 24 * 60 * 60 * 1000);

    const usersToDelete = await User.find({ deletionRequestedAt: { $ne: null, $lte: cutoff } });

    for (const user of usersToDelete) {
      const userId = user._id;

      const urls = await URL.find({ createdBy: userId });
      for (const url of urls) {
        await deleteVisitsByLinkId(url._id.toString());
      }
      await URL.deleteMany({ createdBy: userId });

      const qrs = await QRCode.find({ createdBy: userId });
      for (const qr of qrs) {
        await deleteQRScansByQrId(qr._id.toString());

        if (qr.cloudinaryPublicId) {
          await qrAssetCleanupQueue.add("cleanup-qr-asset", { cloudinaryPublicId: qr.cloudinaryPublicId });
        }
      }
      await QRCode.deleteMany({ createdBy: userId });

      await revokeAllUserSessions(userId.toString());
      await User.deleteOne({ _id: userId });

      logger.info({ jobId: job.id, userId: userId.toString(), linksDeleted: urls.length, qrsDeleted: qrs.length }, "Account hard-deleted after 30-day grace period — email now free for reuse");
    }
  },
  {
    connection: redis,
  }
);

accountHardDeleteWorker.on("failed", (job, error) => {
  logger.error({ jobId: job?.id, err: error }, "Account hard-delete job failed after retries");
});

export default accountHardDeleteWorker;