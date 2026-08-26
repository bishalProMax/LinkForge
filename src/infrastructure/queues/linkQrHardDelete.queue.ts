import { Queue } from "bullmq";
import redis from "../configs/redis.config.js";
import type { RetentionCleanupJob } from "../../shared/types/queue.types.js";

const linkQrHardDeleteQueue = new Queue<RetentionCleanupJob>("linkQrHardDeleteQueue", {
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

export default linkQrHardDeleteQueue;