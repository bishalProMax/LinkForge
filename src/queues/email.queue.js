import { Queue } from "bullmq";
import redis from "../configs/redis.config.js";

const emailQueue = new Queue("emailQueue", {
  connection: redis,
});

export default emailQueue;
