import { Queue } from "bullmq";
import redis from "../configs/redis.config.js";
import type { QRScanEnrichmentJob } from "../../shared/types/queue.types.js";

const qrScanEnrichmentQueue = new Queue<QRScanEnrichmentJob>("qrScanEnrichmentQueue", {
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

export default qrScanEnrichmentQueue;