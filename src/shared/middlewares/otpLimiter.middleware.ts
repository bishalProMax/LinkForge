import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redis from "../../infrastructure/configs/redis.config.js";
import type { Request, Response } from "express";
import getRateLimitRetryTime from "../utils/getRateLimitRetryTime.js";

const OTPLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: [string, ...string[]]) => redis.call(...(args as [string, ...string[]])) as Promise<number>,
  }),
  keyGenerator: (req: Request) => `otplimiter-attempts:${ipKeyGenerator(req.ip ?? "")}`,

  windowMs: 15 * 60 * 1000, // 15 min

  max: 10,

  standardHeaders: true,

  legacyHeaders: false,

  handler: (req: Request, res: Response) => {

    const retryAfter = getRateLimitRetryTime(req);

    return res.status(429).render("forgot-password", {
      error: `Too many OTP requests. Please try again in ${retryAfter}s.`,
      message: null,
    });
  },
});

export default OTPLimiter;

/*NOTE
req.ip??"" is used to ensure that if req.ip is undefined or null, it will default to an empty string. */
