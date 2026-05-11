import { Queue } from "bullmq";
import redis from "../config/redis.js";

const cleanupQueue = new Queue("cleanupQueue", {
  connection: redis,
});

export default cleanupQueue;
