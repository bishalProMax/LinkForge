import { Worker, Job } from "bullmq";
import redis from "../infrastructure/configs/redis.config.js";
import QRCode from "../models/qrCode.model.js";
import { buildQRSvg, rasterizeSvgToPng } from "../shared/services/qrRenderer.service.js";
import { uploadQRImage } from "../shared/services/qrCloudinary.service.js";
import { updateQRStatus } from "../modules/qr/qr.repository.js";
import type { QRGenerationJob } from "../shared/types/queue.types.js";
import logger from "../infrastructure/configs/logger.config.js";

const qrGenerationWorker = new Worker<QRGenerationJob>(
  "qrGenerationQueue",
  async (job: Job<QRGenerationJob>): Promise<void> => {
    const qr = await QRCode.findOne({ qrId: job.data.qrId });

    if (!qr) {
      logger.warn({ qrId: job.data.qrId }, "QR not found during generation, skipping");
      return;
    }

    const redirectTarget = `${process.env.BASE_URL}/qr/${qr.qrId}`;

    const svg = buildQRSvg(redirectTarget, qr.design);
    const pngBuffer = await rasterizeSvgToPng(svg);
    const { imageUrl, publicId } = await uploadQRImage(pngBuffer, qr.createdBy.toString(), qr.qrId);

    await QRCode.findOneAndUpdate({ qrId: qr.qrId }, { svgSource: svg });  
    await updateQRStatus(qr.qrId, "READY", imageUrl, publicId);

    logger.info({ qrId: qr.qrId }, "QR image generated and uploaded");
  },
  {
    connection: redis,
  }
);

qrGenerationWorker.on("failed", async (job, error) => {
  logger.error({ jobId: job?.id, qrId: job?.data?.qrId, err: error }, "QR generation failed after retries");

  if (job?.data?.qrId) {
    await updateQRStatus(job.data.qrId, "FAILED");
  }
});

export default qrGenerationWorker;