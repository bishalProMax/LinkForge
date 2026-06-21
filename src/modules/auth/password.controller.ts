import type { Request, Response } from "express";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import { forgotPassword, verifyResetOTP, resetPassword } from "./password.service.js";

// -----------------------------FORGOT PASSWORD-----------------------------
const handleForgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const old = {
    ...req.body,
  };

  const result = await forgotPassword({
    email: req.body.email,
  });

  //COOLDOWN
  //this part only runs when attacker tries to bypass frontend, by calling api directly. For normal users, frontend will prevent them from making requests until cooldown expires.
  if (result.type === "COOLDOWN_ACTIVE") {
    return res.status(429).render("verify-otp", {
      error: "Please wait before requesting another OTP.",
      message: null,
      cooldown: result.cooldown,
      old,
    });
  }

  if (result.type === "OTP_LIMIT_REACHED") {
    return res.status(429).render("verify-otp", {
      error: "Maximum OTP requests reached. Please try again after 1 hr.",
      message: null,
      cooldown: null,
      old,
    });
  }

  if (result.type === "GOOGLE_LOGIN_REQUIRED") {
    return res.status(400).render("forgot-password", {
      error: "Please continue with Google or create a local signup first.",
      message: null,
    });
  }

  if (result.type === "USER_NOT_FOUND" || result.type === "SUCCESS") {
    return res.status(200).render("verify-otp", {
      error: null,
      message: "OTP has been sent to your email address.",
      cooldown: 60,
      old,
    });
  }
});

// -----------------------------VERIFY RESET OTP-----------------------------
const handleVerifyResetOTP = asyncHandler(async (req: Request, res: Response) => {
  const old = {
    ...req.body,
  };

  const result = await verifyResetOTP({
    email: req.body.email,
    otp: req.body.otp,
  });

  if (result.type === "INVALID_OTP") {
    return res.status(401).render("verify-otp", {
      error: "Invalid OTP",
      message: null,
      cooldown: null,
      old,
    });
  }

  if (result.type === "OTP_EXPIRED") {
    return res.status(410).render("verify-otp", {
      error: "OTP expired",
      message: null,
      cooldown: null,
      old,
    });
  }

  if (result.type === "TOO_MANY_ATTEMPTS") {
    return res.status(429).render("verify-otp", {
      error: "Too many attempts",
      message: null,
      cooldown: null,
      old,
    });
  }

  return res.status(200).render("reset-password", {
    error: null,
    old,
  });
});

// -----------------------------RESET PASSWORD-----------------------------
const handleResetPassword = asyncHandler(async (req: Request, res: Response) => {
  const old = { ...req.body };
  delete old.password;
  delete old.confirmPassword; 

  const result = await resetPassword({
    email: req.body.email,
    password: req.body.password,
  });

  if (result.type === "SESSION_EXPIRED") {
    return res.status(401).render("reset-password", {
      error: "Reset session expired",
      old,
    });
  }

  if (result.type === "SAME_PASSWORD") {
    return res.status(400).render("reset-password", {
      error: "New password must be different from old password",
      old,
    });
  }
  return res.redirect("/login");
});

export { handleForgotPassword, handleVerifyResetOTP, handleResetPassword };
