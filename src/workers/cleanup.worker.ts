import { Worker, Job} from "bullmq";
import redis from "../infrastructure/configs/redis.config.js";
import User from "../models/user.model.js";
import type { CleanupJob } from "../shared/types/queue.types.js";

  const cleanupWorker = new Worker<CleanupJob>("cleanupQueue", async (job: Job<CleanupJob>): Promise<void> => {
    await User.deleteMany({
      isVerified: false,
      createdAt: {$lt: new Date(Date.now() - 1000 * 60 * 60 * 24)}, // 24 hrs
    });

    console.log("Old unverified accounts cleaned");
  },

  {
    connection: redis,
  }
);

export default cleanupWorker;
