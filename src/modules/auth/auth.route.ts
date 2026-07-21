import { Router } from "express";
import passport from "passport";
import { handleUserSignup, handleUserLogin, handleUserLogout, verifyEmail, handleGoogleCallback } from "./auth.controller.js";
import { validateRender } from "../../shared/middlewares/validation.middleware.js";
import { signupSchema, loginSchema, forgotPasswordSchema, verifyOtpSchema, resetPasswordSchema } from "./auth.schemas.js";
import { authenticateUser } from "../../shared/middlewares/auth.middleware.js";
import { signupLimiter, loginLimiter } from "../../shared/middlewares/authRateLimit.middleware.js";
import { handleForgotPassword, handleVerifyResetOTP, handleResetPassword } from "./password.controller.js";
import OTPLimiter from "../../shared/middlewares/otpLimiter.middleware.js";

const router = Router();

//Creates a profile of user
router.route("/signup").post(signupLimiter, validateRender(signupSchema, { view: "signup"}), handleUserSignup);

//Logs in the user and creates a session for them
router.route("/login").post(loginLimiter, validateRender(loginSchema, { view: "login", extraNullField: ["verificationMessage"] }), handleUserLogin);

//Logs out the user and destroys their session
router.route("/logout").post(authenticateUser, handleUserLogout);

// Verifies the user's email using the token sent to their email
router.get("/verify-email/:token", verifyEmail);

// Forgot password routes
router.post("/forgot-password",validateRender(forgotPasswordSchema, { view: "forgot-password", extraNullField: ["message"] }), OTPLimiter, handleForgotPassword);

// Verifies the OTP sent to the user's email for password reset
router.post("/verify-reset-otp",validateRender(verifyOtpSchema, { view: "verify-otp", extraNullField: ["message", "cooldown"]}), handleVerifyResetOTP);

// Resets the user's password after OTP verification
router.post("/reset-password", validateRender(resetPasswordSchema, { view: "reset-password" }), handleResetPassword);

// GOOGLE AUTH
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// GOOGLE CALLBACK
router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/login" }), handleGoogleCallback);

export default router;
