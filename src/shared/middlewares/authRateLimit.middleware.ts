import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redis from "../../infrastructure/configs/redis.config.js";
import type { Request, Response } from "express";
import getRateLimitRetryTime from "../utils/getRateLimitRetryTime.js";


// SIGNUP RATE LIMITER
const signupLimiter = rateLimit({
  store: new RedisStore({
  sendCommand: (...args: [string, ...string[]]) => redis.call(...(args as [string, ...string[]])) as Promise<any>,
}),
  keyGenerator: (req: Request) => `signup:${ipKeyGenerator(req.ip ?? "")}`,

  windowMs: 15 * 60 * 1000, // 15 min

  max: 5,

  standardHeaders: true,

  legacyHeaders: false,

  handler: (req: Request, res: Response) => {
    const old = { ...req.body };
    delete old.password;

    const retryAfter = getRateLimitRetryTime(req);

    return res.status(429).render("signup", {
      error: `Too many signup attempts. Try again in ${retryAfter}s.`,
      old,
    });
  },
});

// LOGIN RATE LIMITER
const loginLimiter = rateLimit({
  store: new RedisStore({
  sendCommand: (...args: [string, ...string[]]) => redis.call(...(args as [string, ...string[]])) as Promise<any>,
}),
  keyGenerator: (req: Request) => `login:${ipKeyGenerator(req.ip ?? "")}`,

  windowMs: 15 * 60 * 1000, // 15 min

  max: 10,

  standardHeaders: true,

  legacyHeaders: false,

  handler: (req: Request, res: Response) => {
    const old = { ...req.body };
    delete old.password;

    const retryAfter = getRateLimitRetryTime(req);

    return res.status(429).render("login", {
      error: `Too many login attempts. Try again in ${retryAfter}s.`,
      old,
      verificationMessage: null,
    });
  },
});

export { 
  signupLimiter, 
  loginLimiter 
};
