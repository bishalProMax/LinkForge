import crypto from "crypto";
import redis from "../configs/redis.config.js";
import emailQueue from "../queues/email.queue.js";
import { createToken } from "./auth.service.js";
import verifyTurnstile from "./turnstile.service.js";
import {
  findUserByEmail,
  createUser,
  findUserByVerificationToken,
  saveUser,
} from "../repositories/user.repository.js";

//SIGNUP SERVICE
const signupUser = async ({ name, email, password, captchaToken, ip }) => {
  const isHuman = await verifyTurnstile(captchaToken, ip);

  if (!isHuman) {
    return {
      success: false,
      type: "CAPTCHA_FAILED",
    };
  }

  const existedUser = await findUserByEmail(email);

  if (existedUser) {
    if (existedUser.isVerified) {
      return {
        success: false,
        type: "EMAIL_EXISTS",
      };
    }

    // UNVERIFIED USER EXISTS RESEND NEW LINK
    const token = crypto.randomBytes(32).toString("hex");
    existedUser.emailVerificationToken = token;
    existedUser.emailVerificationExpires = Date.now() + 1000 * 60 * 30;
    await saveUser(existedUser);

    const verificationLink = `${process.env.BASE_URL}/user/verify-email/${token}`;

    await emailQueue.add("sendVerificationEmail", {
      email: existedUser.email,
      name: existedUser.name,
      verificationLink,
    });

    return {
      success: true,
      type: "RESENT",
    };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const user = await createUser({
    name,
    email,
    password,
    emailVerificationToken: token,
    emailVerificationExpires: Date.now() + 1000 * 60 * 30
  });

  const verificationLink = `${process.env.BASE_URL}/user/verify-email/${token}`;

  await emailQueue.add("sendVerificationEmail", {
    email: user.email,
    name: user.name,
    verificationLink
  });

  return {
    success: true,
    type: "PENDING",
  };
};

//LOGIN SERVICE
const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  if (!user) {
    return {
      success: false,
      type: "EMAIL_NOT_FOUND",
    };
  }

  if (!user.isVerified) {
    return {
      success: false,
      type: "NOT_VERIFIED",
    };
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    await redis.incr(`login:${email}`);
    await redis.expire(`login:${email}`, 300);

    return {
      success: false,
      type: "INVALID_PASSWORD",
    };
  }

  await redis.del(`login:${email}`);

  const token = createToken(user);

  return {
    success: true,
    token,
  };
};

//VERIFY EMAIL SERVICE
const verifyUserEmail = async (token) => {
  const user = await findUserByVerificationToken(token);

  if (!user) {
    return {
      success: false,
    };
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await saveUser(user);

  const loginLink = `${process.env.BASE_URL}/login`;

  await emailQueue.add("sendWelcomeEmail", {
    email: user.email,
    name: user.name,
    loginLink,
  });

  return {
    success: true,
  };
};

export { 
  signupUser, 
  loginUser, 
  verifyUserEmail 
};
