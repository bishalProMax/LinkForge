import { Redis } from "ioredis";
import logger from "./logger.config.js";

const redis = new Redis(process.env.REDIS_URI as string, {
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  logger.info("Redis Connected");
});

redis.on("error", (err: Error) => {
  logger.error({ err }, "Redis connection error");
});

export default redis;
