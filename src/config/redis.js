const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URI);

redis.on("connect", () => {
  console.log("Redis Connected");
});

redis.on("error", (err) => {
  console.log("Redis Error:", err);
});

module.exports = redis;