const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const redis = require("../config/redis");
const { ipKeyGenerator } = require("express-rate-limit");

const signupLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) =>
      redis.call(...args),
  }),
   keyGenerator: (req) =>
    `signup:${ipKeyGenerator(req)}`,

  windowMs: 15 * 60 * 1000, // 15 min

  max: 5, 

  message: {
    error:
      "Too many signup attempts. Please try again later.",
  },

  standardHeaders: true,

  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) =>
      redis.call(...args),
  }),
   keyGenerator: (req) =>
    `login:${ipKeyGenerator(req)}`,

  windowMs: 15 * 60 * 1000, // 15 min

  max: 10,

  message: {
    error:
      "Too many login attempts. Please try again later.",
  },

  standardHeaders: true,

  legacyHeaders: false,
});


module.exports = {
  signupLimiter,
  loginLimiter,
};