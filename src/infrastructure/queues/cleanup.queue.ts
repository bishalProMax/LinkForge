import { Queue } from "bullmq";
import redis from "../configs/redis.config.js";
import type { CleanupJob } from "../../shared/types/queue.types.js";

const cleanupQueue = new Queue<CleanupJob>("cleanupQueue", {
  connection: redis,
});

export default cleanupQueue;
