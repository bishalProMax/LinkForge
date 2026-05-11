import { Worker } from "bullmq";
import redis from "../config/redis.js";
import {sendVerificationEmail,sendWelcomeEmail } from "../service/email.service.js";

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


