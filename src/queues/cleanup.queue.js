import { Queue } from "bullmq";
import redis from "../configs/redis.config.js";

const cleanupQueue = new Queue("cleanupQueue", {
  connection: redis,
});

export default cleanupQueue;
