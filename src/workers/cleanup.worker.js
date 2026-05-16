import { Worker } from "bullmq";
import redis from "../configs/redis.config.js";
import User from "../models/user.model.js";

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
