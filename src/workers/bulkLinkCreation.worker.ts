import { Worker, Job } from "bullmq";
import redis from "../infrastructure/configs/redis.config.js";
import { generateShortURL } from "../modules/url/url.service.js";
import { createUrlSchema } from "../modules/url/url.schemas.js";
import { appendBulkResult } from "../modules/bulk/bulk.repository.js";
import type { BulkLinkRowJob } from "../shared/types/queue.types.js";
import logger from "../infrastructure/configs/logger.config.js";

const bulkLinkCreationWorker = new Worker<BulkLinkRowJob>(
  "bulkLinkCreationQueue",
  async (job: Job<BulkLinkRowJob>): Promise<void> => {
    const { bulkOperationId, userId, row, input } = job.data;

    // Every bulk row runs through the exact same Zod schema a manual single-link submission
    // uses — bulk never gets looser validation than the regular create form.
    const parsed = createUrlSchema.safeParse({ url: input.url, customAlias: input.customAlias, title: input.title, expiration: input.expiration });

    if (!parsed.success) {
      await appendBulkResult(bulkOperationId, { row, status: "FAILED", input, error: parsed.error.issues[0]?.message ?? "Invalid input" });
      return;
    }

    try {
      const shortId = await generateShortURL({ originalURL: parsed.data.url, userId, customAlias: parsed.data.customAlias, title: parsed.data.title, expiration: parsed.data.expiration, customExpiry: parsed.data.customExpiry });
      await appendBulkResult(bulkOperationId, { row, status: "SUCCESS", input, shortId });
    } catch (error) {
      await appendBulkResult(bulkOperationId, { row, status: "FAILED", input, error: error instanceof Error ? error.message : "Something went wrong." });
    }
  },
  { connection: redis }
);

bulkLinkCreationWorker.on("failed", (job, error) => {
  logger.error({ jobId: job?.id, err: error }, "Bulk link row processing failed after retries");
});

export default bulkLinkCreationWorker;