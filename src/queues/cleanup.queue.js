const { Queue } = require("bullmq");
const redis = require("../config/redis.js");

const cleanupQueue = new Queue("cleanupQueue", {
  connection: redis,
});

module.exports = cleanupQueue;
