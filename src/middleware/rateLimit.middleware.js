import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redis from "../config/redis.js";
import { ipKeyGenerator } from "express-rate-limit";

// SIGNUP RATE LIMITER
const signupLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
  keyGenerator: (req) => `signup:${ipKeyGenerator(req.ip)}`,

  windowMs: 15 * 60 * 1000, // 15 min

  max: 5,

  standardHeaders: true,

  legacyHeaders: false,

  handler: (req, res) => {
    const old = { ...req.body };
    delete old.password;

    return res.status(429).render("signup", {
      error: "Too many signup attempts. Please try again later.",
      old,
    });
  },
});

// LOGIN RATE LIMITER
const loginLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
  keyGenerator: (req) => `login:${ipKeyGenerator(req.ip)}`,

  windowMs: 15 * 60 * 1000, // 15 min

  max: 20,

  standardHeaders: true,

  legacyHeaders: false,

  handler: (req, res) => {
    const old = { ...req.body };
    delete old.password;

    return res.status(429).render("login", {
      error: "Too many login attempts. Please try again later.",
      old,
      verificationMessage: null,
    });
  },
});

export {
  signupLimiter,
  loginLimiter,
};
