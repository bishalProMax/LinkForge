import { Worker, Job } from "bullmq";
import redis from "../infrastructure/configs/redis.config.js";
import SecurityEvent from "../models/securityEvent.model.js";
import type { SecurityEventJob } from "../shared/types/queue.types.js";
import logger from "../infrastructure/configs/logger.config.js";

const securityEventWorker = new Worker<SecurityEventJob>("securityEventQueue",async (job: Job<SecurityEventJob>): Promise<void> => {
    await SecurityEvent.create({
      event: job.data.event,
      email: job.data.email,
      userId: job.data.userId,
      ip: job.data.ip,
      metadata: job.data.metadata,
    });
  },
  {
    connection: redis,
  }
);

securityEventWorker.on("failed", (job, error) => {
  logger.error(
    { jobId: job?.id, event: job?.data?.event, attemptsMade: job?.attemptsMade, err: error },
    "Security event failed to persist after retry"
  );
});

export default securityEventWorker;