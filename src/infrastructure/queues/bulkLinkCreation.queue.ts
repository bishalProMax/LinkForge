import { Queue } from "bullmq";
import redis from "../configs/redis.config.js";
import type { BulkLinkRowJob } from "../../shared/types/queue.types.js";

const bulkLinkCreationQueue = new Queue<BulkLinkRowJob>("bulkLinkCreationQueue", {
  connection: redis,
  defaultJobOptions: { 
    attempts: 2, 
    backoff: { 
        type: "exponential", 
        delay: 2000 
    }, 
    removeOnComplete: true, 
    removeOnFail: false 
    },
});

export default bulkLinkCreationQueue;