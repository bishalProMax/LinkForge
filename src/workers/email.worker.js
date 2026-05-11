const { Worker } = require("bullmq");
const redis = require("../config/redis.js");
const { sendVerificationEmail,sendWelcomeEmail } = require("../service/email.service.js");

const emailWorker = new Worker("emailQueue", async (job) => {
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

module.exports = emailWorker;
