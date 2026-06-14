import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URI as string, {
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  console.log("Redis Connected");
});

redis.on("error", (err: Error) => {
  console.log("Redis Error:", err);
});

export default redis;
