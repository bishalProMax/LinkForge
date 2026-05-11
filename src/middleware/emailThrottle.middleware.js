import redis from "../config/redis.js";

const emailThrottle = async (req, res, next) => {
  let { email } = req.body;

  const old = { ...req.body };
  delete old.password;

  if (!email) {
    return next();
  }

  email = email.trim().toLowerCase();

  const key = `login:${email}`;

  const attempts = await redis.get(key);

  if (attempts >= 5) {
    const ttl = await redis.ttl(key);

    return res.status(429).render("login", {
      error: `Too many failed login attempts. Try again in ${ttl} seconds.`,
      old,
      verificationMessage: null
    });
  }

  next();
};

export default emailThrottle;
