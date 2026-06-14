import { Queue } from "bullmq";
import redis from "../configs/redis.config.js";
import type { SendVerificationEmailJob,SendWelcomeEmailJob,SendPasswordResetOTPJob, SendPasswordChangedEmailJob } from "../../shared/types/queue.types.js";

type EmailQueueJobs = SendVerificationEmailJob | SendWelcomeEmailJob | SendPasswordResetOTPJob | SendPasswordChangedEmailJob

const emailQueue = new Queue<EmailQueueJobs>("emailQueue", {
  connection: redis,
});

export default emailQueue;
