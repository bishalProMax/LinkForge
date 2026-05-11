import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URI,
   {
      maxRetriesPerRequest:
        null,
    }
);

redis.on("connect", () => {
  console.log("Redis Connected");
});

redis.on("error", (err) => {
  console.log("Redis Error:", err);
});

export default redis;