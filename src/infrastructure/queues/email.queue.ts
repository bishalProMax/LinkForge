import { Queue } from "bullmq";
import redis from "../configs/redis.config.js";
import type { SendVerificationEmailJob,SendWelcomeEmailJob,SendPasswordResetOTPJob, SendPasswordChangedEmailJob, SendRoleInviteEmailJob, SendAccountBannedEmailJob, SendAccountReinstatedEmailJob } from "../../shared/types/queue.types.js";

type EmailQueueJobs = SendVerificationEmailJob | SendWelcomeEmailJob | SendPasswordResetOTPJob | SendPasswordChangedEmailJob | SendRoleInviteEmailJob | SendAccountBannedEmailJob | SendAccountReinstatedEmailJob

const emailQueue = new Queue<EmailQueueJobs>("emailQueue", {
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

export default emailQueue;
