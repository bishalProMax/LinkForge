import { Worker, Job } from "bullmq";
import redis from "../infrastructure/configs/redis.config.js";
import {sendVerificationEmail,sendWelcomeEmail,sendPasswordResetOTP, sendPasswordChangedEmail } from "../shared/services/email.service.js";
import type { SendVerificationEmailJob, SendWelcomeEmailJob, SendPasswordResetOTPJob, SendPasswordChangedEmailJob } from "../shared/types/queue.types.js";

type EmailJobData = SendVerificationEmailJob | SendWelcomeEmailJob | SendPasswordResetOTPJob | SendPasswordChangedEmailJob;

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
    },

    {
      connection: redis,
    }
  );

  emailWorker.on("failed", (job, error) => {
  console.error(
    `Email job permanently failed after all retries — job: ${job?.name}, id: ${job?.id}, recipient: ${job?.data?.email}`,
    error
  );
});


  export default emailWorker;

