import { Worker, Job } from "bullmq";
import redis from "../infrastructure/configs/redis.config.js";
import { createStandaloneQR } from "../modules/qr/qr.service.js";
import { createStandaloneQRSchema } from "../modules/qr/qr.schemas.js";
import { appendBulkResult } from "../modules/bulk/bulk.repository.js";
import type { BulkQRRowJob } from "../shared/types/queue.types.js";
import logger from "../infrastructure/configs/logger.config.js";

const bulkQrCreationWorker = new Worker<BulkQRRowJob>(
  "bulkQrCreationQueue",
  async (job: Job<BulkQRRowJob>): Promise<void> => {
    const { bulkOperationId, userId, row, input } = job.data;

    const parsed = createStandaloneQRSchema.safeParse({ destinationURL: input.destinationURL, title: input.title, expiration: input.expiration });

    if (!parsed.success) {
      await appendBulkResult(bulkOperationId, { row, status: "FAILED", input, error: parsed.error.issues[0]?.message ?? "Invalid input" });
      return;
    }

    try {
      const qrId = await createStandaloneQR({ destinationURL: parsed.data.destinationURL, userId, title: parsed.data.title, expiration: parsed.data.expiration, customExpiry: parsed.data.customExpiry });
      await appendBulkResult(bulkOperationId, { row, status: "SUCCESS", input, qrId });
    } catch (error) {
      await appendBulkResult(bulkOperationId, { row, status: "FAILED", input, error: error instanceof Error ? error.message : "Something went wrong." });
    }
  },
  { connection: redis }
);

bulkQrCreationWorker.on("failed", (job, error) => {
  logger.error({ jobId: job?.id, err: error }, "Bulk QR row processing failed after retries");
});

export default bulkQrCreationWorker;