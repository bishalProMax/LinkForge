import { Queue } from "bullmq";
import redis from "../configs/redis.config.js";
import type { SecurityEventJob } from "../../shared/types/queue.types.js";

const securityEventQueue = new Queue<SecurityEventJob>("securityEventQueue", {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 3000,
    },
    removeOnComplete: true,
    removeOnFail: false, // keep failed jobs visible for inspection later if mongodb down for long time
  },
});

export default securityEventQueue;