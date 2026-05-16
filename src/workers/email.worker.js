import { Worker } from "bullmq";
import redis from "../configs/redis.config.js";
import {sendVerificationEmail,sendWelcomeEmail } from "../services/email.service.js";

new Worker("emailQueue", async (job) => {
      if (job.name ==="sendVerificationEmail") {
        await sendVerificationEmail(job.data);
      }

      if (job.name ==="sendWelcomeEmail") {
        await sendWelcomeEmail(job.data);
      }
    },

    {
      connection: redis,
    }
  );


