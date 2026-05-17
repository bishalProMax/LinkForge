import { Queue } from "bullmq";
import redis from "../configs/redis.config.js";
import type { SendVerificationEmailJob,SendWelcomeEmailJob } from "../types/queue.types.js";

type EmailQueueJobs = SendVerificationEmailJob | SendWelcomeEmailJob;

const emailQueue = new Queue<EmailQueueJobs>("emailQueue", {
  connection: redis,
});

export default emailQueue;
