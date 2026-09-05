import type { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redis from "../../infrastructure/configs/redis.config.js";
import { logSecurityEvent } from "../services/securityLogger.service.js";
import getRateLimitRetryTime from "../utils/getRateLimitRetryTime.js";

const aiChatLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: [string, ...string[]]) => redis.call(...(args as [string, ...string[]])) as Promise<any>,
  }),
  keyGenerator: (req: Request) => `ai-chat-limiter:${req.user!.id}`,
  windowMs: 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const retryAfter = getRateLimitRetryTime(req);
    logSecurityEvent({ event: "RATE_LIMIT_EXCEEDED", userId: req.user!.id, email: req.user!.email, ip: req.ip ?? "", limiter: "ai-chat" }, "warn");
    return res.status(429).json({ success: false, message: `Too many AI requests. Please wait ${retryAfter}s.` });
  },
});

export default aiChatLimiter;