import { Worker, Job } from "bullmq";
import redis from "../configs/redis.config.js";
import {sendVerificationEmail,sendWelcomeEmail,sendPasswordResetOTP, sendPasswordChangedEmail } from "../services/email.service.js";
import type { SendVerificationEmailJob, SendWelcomeEmailJob, SendPasswordResetOTPJob, SendPasswordChangedEmailJob } from "../types/queue.types.js";

type EmailJobData = SendVerificationEmailJob | SendWelcomeEmailJob | SendPasswordResetOTPJob | SendPasswordChangedEmailJob;

new Worker<EmailJobData>("emailQueue", async (job: Job<EmailJobData>): Promise<void> => {
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


