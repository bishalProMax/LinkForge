const asyncHandler = require("../utils/asyncHandler.js");
const User = require("../models/user.models.js");
const { createToken } = require("../service/auth.service.js");
const { verifyTurnstile } = require("../service/turnstile.service.js");
const redis = require("../config/redis.js");
const crypto = require("crypto");
const emailQueue = require("../queues/email.queue.js");

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
      message: null,
    });
  }

  // CHECK EXISTING USER
  const existedUser = await User.findOne({ email });
  if (existedUser) {

    if (existedUser.isVerified) {
      return res.render("signup", {
        error: "Email already exists",
        old,
      });
    }

    // UNVERIFIED USER EXISTS RESEND NEW LINK

    const token = crypto.randomBytes(32).toString("hex");
    existedUser.emailVerificationToken = token;
    existedUser.emailVerificationExpires = Date.now() + 1000 * 60 * 30;
    await existedUser.save();

    const verificationLink = `${process.env.BASE_URL}/user/verify-email/${token}`;

    await emailQueue.add("sendVerificationEmail", {
      email: existedUser.email,
      name: existedUser.name,
      verificationLink,
    });

    return res.redirect("/login?verification=resent");
  }

  try {
    const token = crypto.randomBytes(32).toString("hex");
    const user = await User.create({
      name,
      email,
      password,
      emailVerificationToken: token,
      emailVerificationExpires: Date.now() + 1000 * 60 * 30, // 30 minutes
    });
    const verificationLink = `${process.env.BASE_URL}/user/verify-email/${token}`;

    await emailQueue.add("sendVerificationEmail", {
      email: user.email,
      name: user.name,
      verificationLink,
    });

    return res.redirect("/login?verification=pending");
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
    return res.render("login", { 
      error: "email not registered", 
      old,
      verificationMessage: null });
  }

  if (!user.isVerified) {
    return res.render("login", {
      error: "Please verify your email first",
      old,
      verificationMessage: null,
    });
  }
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    await redis.incr(`login:${email}`);

    await redis.expire(`login:${email}`, 300); //email login attempts expire after 5 minutes
    return res.render("login", { 
      error: "Invalid password", 
      old,
      verificationMessage: null });
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

//EMAIL VERIFICATION
const verifyEmail = async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }, // Check if token is not expired $gt means greater than
  });

  if (!user) {
    return res.render("verificationStatus", {
    success: false,
    message: "Invalid or expired verification link ❌"
      }
  );
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  const loginLink = `${process.env.BASE_URL}/login`;
  await emailQueue.add("sendWelcomeEmail",
  {
    email: user.email,
    name: user.name,
    loginLink
  }
  );
  
  return res.render("verificationStatus",{
    success: true,
    message: "Email verified successfully ✅"
  });
};

module.exports = {
  handleUserSignup,
  handleUserLogin,
  handleUserLogout,
  verifyEmail,
};
