import { Worker, Job} from "bullmq";
import redis from "../infrastructure/configs/redis.config.js";
import User from "../models/user.model.js";
import type { CleanupJob } from "../shared/types/queue.types.js";
import logger from "../infrastructure/configs/logger.config.js";

  const cleanupWorker = new Worker<CleanupJob>("cleanupQueue", async (job: Job<CleanupJob>): Promise<void> => {
    const result = await User.deleteMany({
      isVerified: false,
      createdAt: {$lt: new Date(Date.now() - 1000 * 60 * 60 * 24)}, // 24 hrs
    });

    logger.info({ jobId: job.id, jobName: job.name, deletedCount: result.deletedCount },"Old unverified accounts cleaned");
  },

  {
    connection: redis,
  }
);

export default cleanupWorker;
