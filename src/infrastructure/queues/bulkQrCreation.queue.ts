import { Queue } from "bullmq";
import redis from "../configs/redis.config.js";
import type { BulkQRRowJob } from "../../shared/types/queue.types.js";

const bulkQrCreationQueue = new Queue<BulkQRRowJob>("bulkQrCreationQueue", {
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

export default bulkQrCreationQueue;