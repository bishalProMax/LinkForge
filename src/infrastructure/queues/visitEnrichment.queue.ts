import { Queue } from "bullmq";
import redis from "../configs/redis.config.js";
import type { VisitEnrichmentJob } from "../../shared/types/queue.types.js";

const visitEnrichmentQueue = new Queue<VisitEnrichmentJob>("visitEnrichmentQueue", {
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

export default visitEnrichmentQueue;