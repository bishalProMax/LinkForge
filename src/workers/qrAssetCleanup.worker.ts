import { Worker, Job } from "bullmq";
import redis from "../infrastructure/configs/redis.config.js";
import { deleteQRImage } from "../shared/services/qrCloudinary.service.js";
import type { QRAssetCleanupJob } from "../shared/types/queue.types.js";
import logger from "../infrastructure/configs/logger.config.js";

const qrAssetCleanupWorker = new Worker<QRAssetCleanupJob>(
  "qrAssetCleanupQueue",
  async (job: Job<QRAssetCleanupJob>): Promise<void> => {
    await deleteQRImage(job.data.cloudinaryPublicId);
    logger.info({ publicId: job.data.cloudinaryPublicId }, "Orphaned QR Cloudinary asset deleted");
  },
  {
    connection: redis,
  }
);

qrAssetCleanupWorker.on("failed", (job, error) => {
  logger.error({ jobId: job?.id, publicId: job?.data?.cloudinaryPublicId, err: error }, "QR asset cleanup failed after retries");
});

export default qrAssetCleanupWorker;