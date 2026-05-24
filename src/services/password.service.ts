import bcrypt from "bcrypt";
import crypto from "crypto";
import redis from "../configs/redis.config.js";
import emailQueue from "../queues/email.queue.js";
import { findUserByEmail, saveUser } from "../repositories/user.repository.js";
import type { ForgotPasswordProps, ForgotPasswordResult, VerifyResetOTPProps, VerifyOTPResult, ResetPasswordProps, ResetPasswordResult } from "../types/user.types.js";

// -----------------------------FORGOT PASSWORD-----------------------------
const forgotPassword = async ({ email }: ForgotPasswordProps): Promise<ForgotPasswordResult> => {
  const user = await findUserByEmail(email);

  if (!user) {
    return {
      type: "USER_NOT_FOUND",
    };
  }

  if (!user.authProviders.includes("local")) {
    return {
      type: "GOOGLE_LOGIN_REQUIRED",
    };
  }

  // EMAIL OTP LIMIT
  const sendCount = Number(await redis.get(`password-resend-otp-count:${email}`)) || 0;

  if (sendCount >= 5) {
    return {
      type: "OTP_LIMIT_REACHED",
    };
  }

  // COOLDOWN
  //this part only runs when attacker tries to bypass frontend, by calling api directly. For normal users, frontend will prevent them from making requests until cooldown expires.
  const cooldown = await redis.ttl(`password-resend-otp-cooldown-timer:${email}`);
  if (cooldown > 0) {
    return {
      type: "COOLDOWN_ACTIVE",
      cooldown,
    };
  }

  // GENERATE OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const hashedOTP = await bcrypt.hash(otp, 10);

  await redis.set(`password-otp-generated:${email}`, hashedOTP, "EX", 300);

  // SET COOLDOWN
  await redis.set(`password-resend-otp-cooldown-timer:${email}`, "active", "EX", 60);

  // OTP SEND COUNT
  const updatedCount = await redis.incr(`password-resend-otp-count:${email}`);

  if (updatedCount === 1) {
    await redis.expire(`password-resend-otp-count:${email}`, 3600);
  }

  // SEND OTP EMAIL
  await emailQueue.add("sendPasswordResetOTP", {
    email,
    name: user.name,
    otp,
  });

  return {
    type: "SUCCESS",
  };
};

// -----------------------------VERIFY RESET OTP-----------------------------
const verifyResetOTP = async ({ email, otp }: VerifyResetOTPProps): Promise<VerifyOTPResult> => {
  const storedOTP = await redis.get(`password-otp-generated:${email}`);

  if (!storedOTP) {
    return {
      type: "OTP_EXPIRED",
    };
  }

  const attempts = Number(await redis.get(`password-reset-otp-attempts:${email}`)) || 0;

  if (attempts >= 5) {
    return {
      type: "TOO_MANY_ATTEMPTS",
    };
  }

  const isMatch = await bcrypt.compare(otp, storedOTP);

  if (!isMatch) {
    const attempts = await redis.incr(`password-reset-otp-attempts:${email}`);

    if (attempts === 1) {
      await redis.expire(`password-reset-otp-attempts:${email}`, 600);
    }
    return {
      type: "INVALID_OTP",
    };
  }

  await redis.del(`password-otp-generated:${email}`);
  await redis.del(`password-reset-otp-attempts:${email}`);
  await redis.del(`password-resend-otp-count:${email}`);
  await redis.set(`password-reset-session:${email}`, "verified", "EX", 600);

  return {
    type: "SUCCESS",
  };
};

// -----------------------------RESET PASSWORD-----------------------------
const resetPassword = async ({ email, password }: ResetPasswordProps): Promise<ResetPasswordResult> => {
  const session = await redis.get(`password-reset-session:${email}`);

  if (!session) {
    return {
      type: "SESSION_EXPIRED",
    };
  }

  const user = await findUserByEmail(email);

  if (!user) {
    return {
      type: "SESSION_EXPIRED",
    };
  }

  const isSamePassword = await user.comparePassword(password);

  if (isSamePassword) {
    return {
      type: "SAME_PASSWORD",
    };
  }
  user.password = password;
  await saveUser(user);

  await redis.del(`password-reset-session:${email}`);

  const loginLink = `${process.env.BASE_URL}/login`;

  await emailQueue.add("sendPasswordChangedEmail", {
    email,
    name: user.name,
    loginLink,
  });

  return {
    type: "SUCCESS",
  };
};

export { forgotPassword, verifyResetOTP, resetPassword };

/*NOTE:
password-resend-otp-count: tracks the number of otps sent to a user within 1 hrs.
password-resend-otp-cooldown-timer: prevents users from requesting multiple otps within a short time frame (1 minute).
password-otp-generated: stores the hashed otp for a user, valid for 5 minutes.
password-reset-otp-attempts: tracks the number of failed otp verification attempts, expires after 10 minutes.
password-reset-session: indicates that the user has successfully verified their otp and can proceed to reset their password, window expires after 10 minutes.
*/
