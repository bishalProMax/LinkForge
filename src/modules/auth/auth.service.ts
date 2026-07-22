import crypto from "crypto";
import redis from "../../infrastructure/configs/redis.config.js";
import emailQueue from "../../infrastructure/queues/email.queue.js";
import { createToken, createRefreshSession } from "../../shared/services/jwt.service.js"
import verifyTurnstile from "../../shared/services/turnstile.service.js";
import { findUserByEmail, createUser, findUserByVerificationToken, saveUser } from "../user/user.repository.js";
import type { SignupUserProps, SignupResult, LoginUserProps, LoginResult, VerifyEmailResult } from "../user/user.types.js";
import { logSecurityEvent } from "../../shared/services/securityLogger.service.js";

//----------------------------SIGNUP SERVICE------------------------------------
const signupUser = async ({ name, email, password, captchaToken, ip }: SignupUserProps): Promise<SignupResult> => {
  const isHuman = await verifyTurnstile(captchaToken, ip);

  if (!isHuman) {
    logSecurityEvent({ event: "SIGNUP_CAPTCHA_FAILED", email, ip });
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

      logSecurityEvent({ event: "SIGNUP_LOCAL_PROVIDER_LINKED", email, ip, userId: existedUser._id.toString() }, "info");
      return {
        type: "LOCAL_PROVIDER_LINKED",
      };
    }

    if (existedUser.isVerified) {
      logSecurityEvent({ event: "SIGNUP_EMAIL_EXISTS", email, ip });
      return {
        type: "EMAIL_EXISTS",
      };
    }

    // EMAIL RESEND COOLDOWN
    const cooldown = await redis.ttl(`signup-resend-cooldown:${email}`);
    if (cooldown > 0) {
      logSecurityEvent({ event: "SIGNUP_COOLDOWN_ACTIVE", email, ip, cooldown });
      return {
        type: "COOLDOWN_ACTIVE",
        cooldown,
      };
    }

    const sendCount = Number(await redis.get(`signup-resend-count:${email}`)) || 0;
    if (sendCount >= 2) {
      logSecurityEvent({ event: "SIGNUP_RESEND_LIMIT_REACHED", email, ip });
      return {
        type: "RESEND_LIMIT_REACHED",
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

    // SET COOLDOWN + INCREMENT SEND COUNT
    await redis.set(`signup-resend-cooldown:${email}`, "active", "EX", 60);
    const updatedCount = await redis.incr(`signup-resend-count:${email}`);
    if (updatedCount === 1) {
      await redis.expire(`signup-resend-count:${email}`, 3600);
    }

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
const loginUser = async ({ email, password, ip }: LoginUserProps): Promise<LoginResult> => {
  const attempts = Number(await redis.get(`login:${email}`)) || 0;

  if (attempts >= 5) {
    const ttl = await redis.ttl(`login:${email}`);
    logSecurityEvent({ event: "LOGIN_TOO_MANY_ATTEMPTS", email, ip, attempts });
    return {
      type: "TOO_MANY_ATTEMPTS",
      retryAfter: ttl,
    };
  }

  const user = await findUserByEmail(email);

  if (!user) {
    logSecurityEvent({ event: "LOGIN_FAILED", email, ip, reason: "EMAIL_NOT_FOUND" });
    return {
      type: "EMAIL_NOT_FOUND",
    };
  }

  if (!user.authProviders.includes("local")) {
    logSecurityEvent({ event: "LOGIN_GOOGLE_REQUIRED", email, ip, userId: user._id.toString() });
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

    logSecurityEvent({ event: "LOGIN_FAILED", email, ip, userId: user._id.toString(), reason: "INVALID_PASSWORD", attempts });
    return {
      type: "INVALID_PASSWORD",
    };
  }

  await redis.del(`login:${email}`);

  logSecurityEvent({ event: "LOGIN_SUCCESS", email, ip, userId: user._id.toString() }, "info");
  const accessToken = createToken(user);
  const refreshToken = await createRefreshSession(user);
  return {
    type: "SUCCESS",
    accessToken,
    refreshToken
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
