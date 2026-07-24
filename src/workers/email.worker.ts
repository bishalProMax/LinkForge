import { Worker, Job } from "bullmq";
import redis from "../infrastructure/configs/redis.config.js";
import {sendVerificationEmail,sendWelcomeEmail,sendPasswordResetOTP, sendPasswordChangedEmail, sendRoleInviteEmail } from "../shared/services/email.service.js";
import type { SendVerificationEmailJob, SendWelcomeEmailJob, SendPasswordResetOTPJob, SendPasswordChangedEmailJob, SendRoleInviteEmailJob } from "../shared/types/queue.types.js";
import logger from "../infrastructure/configs/logger.config.js";
import type {EmailJobData} from "../shared/types/queue.types.js"

  const emailWorker = new Worker<EmailJobData>("emailQueue", async (job: Job<EmailJobData>): Promise<void> => {
      if (job.name ==="sendVerificationEmail") {
        await sendVerificationEmail(job.data as SendVerificationEmailJob);
      }

      if (job.name ==="sendWelcomeEmail") {
        await sendWelcomeEmail(job.data as SendWelcomeEmailJob);
      }

      if (job.name ==="sendPasswordResetOTP") {
        await sendPasswordResetOTP(job.data as SendPasswordResetOTPJob);
      }

      if (job.name ==="sendPasswordChangedEmail") {
        await sendPasswordChangedEmail(job.data as SendPasswordChangedEmailJob);
      }

        if (job.name === "sendRoleInviteEmail") {
        await sendRoleInviteEmail(job.data as SendRoleInviteEmailJob);
      }
    },

    {
      connection: redis,
    }
  );

  emailWorker.on("failed", (job, error) => {
  logger.error({ jobName: job?.name, jobId: job?.id, recipient: job?.data?.email, err: error },"Email job permanently failed after all retries");
});


  export default emailWorker;

