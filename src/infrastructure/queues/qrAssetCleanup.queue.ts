import { Queue } from "bullmq";
import redis from "../configs/redis.config.js";
import type { QRAssetCleanupJob } from "../../shared/types/queue.types.js";

const qrAssetCleanupQueue = new Queue<QRAssetCleanupJob>("qrAssetCleanupQueue", {
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

export default qrAssetCleanupQueue;