import { Queue } from "bullmq";
import redis from "../configs/redis.config.js";
import type { QRGenerationJob } from "../../shared/types/queue.types.js";

const qrGenerationQueue = new Queue<QRGenerationJob>("qrGenerationQueue", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export default qrGenerationQueue;