import { Queue } from "bullmq";
import redis from "../configs/redis.config.js";
import type { CleanupJob } from "../../shared/types/queue.types.js";

const cleanupQueue = new Queue<CleanupJob>("cleanupQueue", {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 3000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export default cleanupQueue;
