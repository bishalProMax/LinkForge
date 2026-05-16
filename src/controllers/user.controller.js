/* eslint-disable no-unused-vars */
import asyncHandler from "../utils/asyncHandler.js";
import authCookieOptions from "../utils/cookieOptions.js";
import { signupUser, loginUser, verifyUserEmail } from "../services/user.service.js";

// SIGNUP
const handleUserSignup = asyncHandler(async (req, res) => {
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
      ip: req.ip,
    });

    if (!result.success && result.type === "CAPTCHA_FAILED") {
      return res.render("signup", {
        error: "Captcha verification failed",
        old,
        message: null
      });
    }

    if (!result.success && result.type === "EMAIL_EXISTS") {
      return res.render("signup", {
        error: "Email already exists",
        old
      });
    }

    if (result.type === "RESENT") {
      return res.redirect("/login?verification=resent");
    }

    return res.redirect("/login?verification=pending");
  } catch (error) {
    return res.render("signup", {
      error: "something went wrong while registering the user",
      old
    });
  }
});

// LOGIN
const handleUserLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const old = { ...req.body};
  delete old.password;

  const result = await loginUser({
    email,
    password
  });

  if (!result.success && result.type === "EMAIL_NOT_FOUND") {
    return res.render("login", {
      error: "Invalid credentials",
      old,
      verificationMessage: null
    });
  }

  if (!result.success && result.type === "NOT_VERIFIED") {
    return res.render("login", {
      error: "Please verify your email first",
      old,
      verificationMessage: null
    });
  }

  if (!result.success && result.type === "INVALID_PASSWORD") {
    return res.render("login", {
      error: "Invalid credentials",
      old,
      verificationMessage: null
    });
  }

  res.cookie("token", result.token, authCookieOptions);

  return res.redirect("/linkforge");
});

// LOGOUT
const handleUserLogout = (req, res) => {
  res.clearCookie("token", authCookieOptions);

  return res.redirect("/login");
};

// EMAIL VERIFICATION
const verifyEmail = asyncHandler(async (req, res) => {
  const result = await verifyUserEmail(req.params.token);

  if (!result.success) {
    return res.render("verificationStatus", {
      success: false,
      message: "Invalid or expired verification link ❌",
    });
  }

  return res.render("verificationStatus", {
    success: true,
    message: "Email verified successfully ✅",
  });
});

export { 
  handleUserSignup, 
  handleUserLogin, 
  handleUserLogout, 
  verifyEmail 
};
