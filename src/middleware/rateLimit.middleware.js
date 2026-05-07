const rateLimit = require("express-rate-limit");

const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min

  max: 5, 

  message: {
    error:
      "Too many signup attempts. Please try again later.",
  },

  standardHeaders: true,

  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
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