import asyncHandler from "../../shared/utils/asyncHandler.js";
import type { UserDocument } from "../../models/user.model.js";
import { accessTokenCookieOptions, refreshTokenCookieOptions } from "../../shared/utils/cookieOptions.js";
import { createToken, revokeRefreshSession, createRefreshSession } from "../../shared/services/jwt.service.js";
import { signupUser, loginUser, verifyUserEmail } from "./auth.service.js";
import type { Request, Response } from "express";
import type { UserPayload } from "../../shared/types/jwt.types.js";

// -----------------------------SIGNUP-----------------------------
const handleUserSignup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const old = {
    ...req.body,
  };

  delete old.password

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

    if (result.type === "COOLDOWN_ACTIVE") {
      return res.status(429).render("signup", {
        error: `Please wait ${result.cooldown}s before requesting another verification email.`,
        old,
      });
    }

    if (result.type === "RESEND_LIMIT_REACHED") {
      return res.status(429).render("signup", {
        error: "Maximum verification email requests reached. Please try again after 1 hour.",
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
    ip: req.ip ?? "",
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
  res.cookie("accessToken", result.accessToken, accessTokenCookieOptions);
  res.cookie("refreshToken", result.refreshToken, refreshTokenCookieOptions);
  }

  return res.redirect("/dashboard");
});

// -----------------------------LOGOUT-----------------------------
const handleUserLogout = asyncHandler(async (req: Request, res: Response) => {
  const refreshCookie = req.cookies?.refreshToken;

  if (refreshCookie) {
    await revokeRefreshSession(refreshCookie);
  }

  res.clearCookie("accessToken", accessTokenCookieOptions);
  res.clearCookie("refreshToken", refreshTokenCookieOptions);

  return res.redirect("/");
});

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

// -----------------------------GOOGLE CALLBACK-----------------------------
const handleGoogleCallback = asyncHandler(async (req: Request, res: Response) => {
  const googleUser = req.user as UserDocument;

  const userPayload: UserPayload = {
    _id: googleUser._id,
    email: googleUser.email,
    name: googleUser.name,
    role: googleUser.role
  };

  const accessToken = createToken(userPayload);
  const refreshToken = await createRefreshSession(userPayload);

  res.cookie("accessToken", accessToken, accessTokenCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  return res.redirect("/dashboard");
});

export { 
  handleUserSignup, 
  handleUserLogin,
  handleUserLogout, 
  verifyEmail,  
  handleGoogleCallback 
  };
