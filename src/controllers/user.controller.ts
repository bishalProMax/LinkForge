/* eslint-disable no-unused-vars */
import asyncHandler from "../utils/asyncHandler.js";
import cookieOptions from "../utils/cookieOptions.js";
import { signupUser, loginUser, verifyUserEmail } from "../services/user.service.js";
import type { Request, Response } from "express";

// -----------------------------SIGNUP-----------------------------
const handleUserSignup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const old = {
    ...req.body,
  };

  delete old.password;

  try {
    const result = await signupUser({
      name,
      email,
      password,
      captchaToken: req.body["cf-turnstile-response"],
      ip: req.ip ?? "",
    });

    if (result.type === "CAPTCHA_FAILED") {
      return res.status(400).render("signup", {
        error: "Captcha verification failed",
        old,
        message: null,
      });
    }

    if (result.type === "EMAIL_EXISTS") {
      return res.status(409).render("signup", {
        error: "Email already exists",
        old,
      });
    }

    if (result.type === "LOCAL_PROVIDER_LINKED") {
      return res.redirect("/login");
    }

    if (result.type === "RESENT") {
      return res.redirect("/login?verification=resent");
    }
    if (result.type === "PENDING") {
      return res.redirect("/login?verification=pending");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).render("signup", {
      error: "something went wrong while registering the user",
      old,
    });
  }
});

// -----------------------------LOGIN-----------------------------
const handleUserLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const old = { ...req.body };
  delete old.password;

  const result = await loginUser({
    email,
    password,
  });

  if (result.type === "EMAIL_NOT_FOUND") {
    return res.status(401).render("login", {
      error: "Invalid credentials",
      old,
      verificationMessage: null,
    });
  }

  if (result.type === "NOT_VERIFIED") {
    return res.status(403).render("login", {
      error: "Please verify your email first",
      old,
      verificationMessage: null,
    });
  }

  if (result.type === "TOO_MANY_ATTEMPTS") {
    return res.status(429).render("login", {
      error: `Too many failed login attempts. Try again in ${result.retryAfter} seconds.`,
      old,
      verificationMessage: null,
    });
  }

  if (result.type === "GOOGLE_LOGIN_REQUIRED") {
    return res.status(400).render("login", {
      error: "Please continue with Google or create a local signup first.",
      old,
      verificationMessage: null,
    });
  }

  if (result.type === "INVALID_PASSWORD") {
    return res.status(401).render("login", {
      error: "Invalid credentials",
      old,
      verificationMessage: null,
    });
  }

  if (result.type === "SUCCESS") {
    res.cookie("token", result.token, cookieOptions);
  }

  return res.redirect("/linkforge");
});

// -----------------------------LOGOUT-----------------------------
const handleUserLogout = (req: Request, res: Response) => {
  res.clearCookie("token", cookieOptions);

  return res.redirect("/");
};

// -----------------------------EMAIL VERIFICATION-------------------
const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const token = req.params.token as string;
  const result = await verifyUserEmail(token);

  if (result.type === "INVALID_TOKEN") {
    return res.status(400).render("verificationStatus", {
      success: false,
      message: "Invalid or expired verification link ❌",
    });
  }

  if (result.type === "SUCCESS") {
    return res.status(200).render("verificationStatus", {
      success: true,
      message: "Email verified successfully ✅",
    });
  }
});

export { handleUserSignup, handleUserLogin, handleUserLogout, verifyEmail };
