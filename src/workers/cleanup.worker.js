import { Worker } from "bullmq";
import redis from "../config/redis.js";
import User from "../models/user.models.js";

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
