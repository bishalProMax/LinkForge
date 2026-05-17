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
      return res.render("signup", {
        error: "Captcha verification failed",
        old,
        message: null
      });
    }

    if (result.type === "EMAIL_EXISTS") {
      return res.render("signup", {
        error: "Email already exists",
        old
      });
    }

    if (result.type === "RESENT") {
      return res.redirect("/login?verification=resent");
    }
    if(result.type === "PENDING") {
    return res.redirect("/login?verification=pending");
    }
  } 
  catch (error) {
    console.error(error);
    return res.render("signup", {
      error: "something went wrong while registering the user",
      old
    });
  }
});


// -----------------------------LOGIN-----------------------------
const handleUserLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const old = { ...req.body};
  delete old.password;

  const result = await loginUser({
    email,
    password
  });

  if (result.type === "EMAIL_NOT_FOUND") {
    return res.render("login", {
      error: "Invalid credentials",
      old,
      verificationMessage: null
    });
  }

  if (result.type === "NOT_VERIFIED") {
    return res.render("login", {
      error: "Please verify your email first",
      old,
      verificationMessage: null
    });
  }

  if (result.type === "INVALID_PASSWORD") {
    return res.render("login", {
      error: "Invalid credentials",
      old,
      verificationMessage: null
    });
  }

  if (result.type === "SUCCESS") {
    res.cookie( "token", result.token, cookieOptions );
  }
  
  return res.redirect("/linkforge");
});


// -----------------------------LOGOUT-----------------------------
const handleUserLogout = (req: Request, res: Response) => {
  res.clearCookie("token", cookieOptions);

  return res.redirect("/login");
};


// -----------------------------EMAIL VERIFICATION-------------------
const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const token = req.params.token as string;
  const result = await verifyUserEmail(token);

  if (result.type === "INVALID_TOKEN") {
    return res.render("verificationStatus", {
      success: false,
      message: "Invalid or expired verification link ❌",
    });
  }

  if(result.type === "SUCCESS") {
  return res.render("verificationStatus", {
    success: true,
    message: "Email verified successfully ✅",
  });
}
});


export { 
  handleUserSignup, 
  handleUserLogin, 
  handleUserLogout, 
  verifyEmail 
};
