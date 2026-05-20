import crypto from "crypto";
import redis from "../configs/redis.config.js";
import emailQueue from "../queues/email.queue.js";
import { createToken } from "./auth.service.js";
import verifyTurnstile from "./turnstile.service.js";
import { findUserByEmail, createUser, findUserByVerificationToken, saveUser } from "../repositories/user.repository.js";
import type { SignupUserProps, SignupResult, LoginUserProps, LoginResult, VerifyEmailResult } from "../types/user.types.js";

//----------------------------SIGNUP SERVICE------------------------------------
const signupUser = async ({ name, email, password, captchaToken, ip }: SignupUserProps): Promise<SignupResult> => {
  const isHuman = await verifyTurnstile(captchaToken, ip);

  if (!isHuman) {
    return {
      type: "CAPTCHA_FAILED",
    };
  }

  const existedUser = await findUserByEmail(email);

  if (existedUser) {
    if (existedUser.isVerified) {
      return {
        type: "EMAIL_EXISTS",
      };
    }

    // UNVERIFIED USER EXISTS RESEND NEW LINK
    const token = crypto.randomBytes(32).toString("hex");
    existedUser.emailVerificationToken = token;
    existedUser.emailVerificationExpires = new Date(Date.now() + 1000 * 60 * 30);
    await saveUser(existedUser);

    const verificationLink = `${process.env.BASE_URL}/user/verify-email/${token}`;

    await emailQueue.add("sendVerificationEmail", {
      email: existedUser.email,
      name: existedUser.name,
      verificationLink,
    });

    return {
      type: "RESENT",
    };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const user = await createUser({
    name,
    email,
    password,
    emailVerificationToken: token,
    emailVerificationExpires: new Date (Date.now() + 1000 * 60 * 30)
  });

  const verificationLink = `${process.env.BASE_URL}/user/verify-email/${token}`;

  await emailQueue.add("sendVerificationEmail", {
    email: user.email,
    name: user.name,
    verificationLink
  });

  return {
    type: "PENDING"
  };
};

//----------------------------LOGIN SERVICE------------------------------------
const loginUser = async ({ email, password }: LoginUserProps): Promise<LoginResult> => {

  const attempts = Number(await redis.get(`login:${email}`)) || 0;

  if (attempts >= 5) {
    const ttl = await redis.ttl(`login:${email}`);
    return {
      type: "TOO_MANY_ATTEMPTS",
      retryAfter: ttl,
    };
  }

  const user = await findUserByEmail(email);
  
  if (!user) {
    return {
      type: "EMAIL_NOT_FOUND"
    };
  }

  if (!user.isVerified) {
    return {
      type: "NOT_VERIFIED",
    };
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {

    const attempts = await redis.incr(`login:${email}`);
    if (attempts === 1) {
    await redis.expire(`login:${email}`, 300);
    }

    return {
      type: "INVALID_PASSWORD",
    };
  }

  await redis.del(`login:${email}`);

  const token = createToken(user);

  return {
    type: "SUCCESS",
    token,
  };
};

//----------------------------VERIFY EMAIL SERVICE------------------------------------
const verifyUserEmail = async (token: string): Promise<VerifyEmailResult> => {
  const user = await findUserByVerificationToken(token);

  if (!user) {
    return {
      type: "INVALID_TOKEN"
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
    type: "SUCCESS"
  };
};

export { 
  signupUser, 
  loginUser, 
  verifyUserEmail 
};
