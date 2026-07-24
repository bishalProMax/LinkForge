import { Queue } from "bullmq";
import redis from "../configs/redis.config.js";
import type { SendVerificationEmailJob,SendWelcomeEmailJob,SendPasswordResetOTPJob, SendPasswordChangedEmailJob, SendRoleInviteEmailJob } from "../../shared/types/queue.types.js";

type EmailQueueJobs = SendVerificationEmailJob | SendWelcomeEmailJob | SendPasswordResetOTPJob | SendPasswordChangedEmailJob | SendRoleInviteEmailJob

const emailQueue = new Queue<EmailQueueJobs>("emailQueue", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});

export default emailQueue;
