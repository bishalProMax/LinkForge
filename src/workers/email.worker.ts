import { Worker, Job } from "bullmq";
import redis from "../configs/redis.config.js";
import {sendVerificationEmail,sendWelcomeEmail } from "../services/email.service.js";
import type { SendVerificationEmailJob, SendWelcomeEmailJob } from "../types/queue.types.js";

type EmailJobData = SendVerificationEmailJob | SendWelcomeEmailJob;

new Worker<EmailJobData>("emailQueue", async (job: Job<EmailJobData>): Promise<void> => {
      if (job.name ==="sendVerificationEmail") {
        await sendVerificationEmail(job.data as SendVerificationEmailJob);
      }

      if (job.name ==="sendWelcomeEmail") {
        await sendWelcomeEmail(job.data as SendWelcomeEmailJob);
      }
    },

    {
      connection: redis,
    }
  );


