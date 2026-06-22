import crypto from "crypto";
import bcrypt from "bcrypt";
import redis from "../../infrastructure/configs/redis.config.js";
import emailQueue from "../../infrastructure/queues/email.queue.js";
import { createToken } from "../../shared/services/jwt.service.js";
import verifyTurnstile from "../../shared/services/turnstile.service.js";
import { findUserByEmail, createUser, findUserByVerificationToken, saveUser } from "../user/user.repository.js";
import type { SignupUserProps, SignupResult, LoginUserProps, LoginResult, VerifyEmailResult } from "../user/user.types.js";

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
    if (existedUser.authProviders.includes("google") && !existedUser.authProviders.includes("local")) {
      existedUser.password = password;

      existedUser.authProviders.push("local");

      await saveUser(existedUser);

      return {
        type: "LOCAL_PROVIDER_LINKED",
      };
    }

    if (existedUser.isVerified) {
      return {
        type: "EMAIL_EXISTS",
      };
    }

    // UNVERIFIED USER EXISTS RESEND NEW LINK
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    existedUser.emailVerificationToken = hashedToken;
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
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await createUser({
    name,
    email,
    password,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: new Date(Date.now() + 1000 * 60 * 30),
  });

  const verificationLink = `${process.env.BASE_URL}/user/verify-email/${token}`;

  await emailQueue.add("sendVerificationEmail", {
    email: user.email,
    name: user.name,
    verificationLink,
  });

  return {
    type: "PENDING",
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
      type: "EMAIL_NOT_FOUND",
    };
  }

  if (!user.authProviders.includes("local")) {
    return {
      type: "GOOGLE_LOGIN_REQUIRED",
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
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await findUserByVerificationToken(hashedToken);

  if (!user) {
    return {
      type: "INVALID_TOKEN",
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
    type: "SUCCESS",
  };
};

export { signupUser, loginUser, verifyUserEmail };
