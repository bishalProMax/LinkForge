import { Redis } from "ioredis";
import redis from "./redis.config.js";
import logger from "./logger.config.js";

// A dedicated duplicate connection for Redis pub/sub subscribing — a client in subscriber mode can't run any other commands like INCR/GET/SET, so this must stay separate from the main 'redis' client used forBullMQ, sessions, and rate limiting.
const redisSubscriber: Redis = redis.duplicate();

redisSubscriber.on("error", (err: Error) => {
  logger.error({ err }, "Redis subscriber connection error");
});

export default redisSubscriber;