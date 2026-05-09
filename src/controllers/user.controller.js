const asyncHandler = require("../utils/asyncHandler.js");
const User = require("../models/user.models.js");
const { createToken } = require("../service/auth.service.js");
const { verifyTurnstile } = require("../service/turnstile.service.js");
const redis = require("../config/redis");

//SIGNUP
const handleUserSignup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const old = { ...req.body };
  delete old.password;

  // CAPTCHA TOKEN
  const captchaToken = req.body["cf-turnstile-response"];
  // VERIFY CAPTCHA
  const isHuman = await verifyTurnstile(captchaToken, req.ip);

  if (!isHuman) {
    return res.render("signup", {
      error: "Captcha verification failed",
      old,
    });
  }

  // CHECK EXISTING USER
  const existedUser = await User.findOne({ email });
  if (existedUser) {
    return res.render("signup", {
      error: "Email already exists",
      old,
    });
  }

  try {
    await User.create({ name, email, password });
    return res.redirect("/login");
  } catch (err) {
    console.log(err);
    return res.render("signup", {
      error: "something went wrong while registering the user",
      old,
    });
  }
});

//LOGIN
const handleUserLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const old = { ...req.body };
  delete old.password;

  const user = await User.findOne({ email });

  if (!user) {
    return res.render("login", { error: "email not registered", old });
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    await redis.incr(`login:${email}`);

    await redis.expire(`login:${email}`, 300);   //email login attempts expire after 5 minutes
    return res.render("login", { error: "Invalid password", old });
  }

  await redis.del(`login:${email}`); // reset login attempts on successful login
  
  const token = createToken(user);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  return res.redirect("/linkforge");
});

//LOGOUT
const handleUserLogout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  return res.redirect("/login");
};

module.exports = {
  handleUserSignup,
  handleUserLogin,
  handleUserLogout,
};
