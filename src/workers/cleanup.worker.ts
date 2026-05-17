import { Worker, Job} from "bullmq";
import redis from "../configs/redis.config.js";
import User from "../models/user.model.js";
import type { CleanupJob } from "../types/queue.types.js";

new Worker<CleanupJob>("cleanupQueue", async (job: Job<CleanupJob>): Promise<void> => {
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
