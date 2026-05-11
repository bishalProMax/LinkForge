const { Worker } = require("bullmq");
const redis = require("../config/redis.js");
const User = require("../models/user.models.js");

new Worker("cleanupQueue", async () => {
    await User.deleteMany({
      isVerified: false,
      createdAt: {$lt: new Date(Date.now() - 1000 * 60 * 60 * 24)}, // 24 hrs
    });

    console.log("Old unverified accounts cleaned");
  },

  {
    connection: redis,
  }
);
