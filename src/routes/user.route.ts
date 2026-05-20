import { Router } from "express";
import { handleUserSignup, handleUserLogin, handleUserLogout, verifyEmail } from "../controllers/user.controller.js";
import { validateSignup, validateLogin } from "../middlewares/validation.middleware.js";
import authenticateUser from "../middlewares/auth.middleware.js";
import { signupLimiter, loginLimiter } from "../middlewares/rateLimit.middleware.js";
import { handleForgotPassword, handleVerifyResetOTP, handleResetPassword } from "../controllers/password.controller.js";
import OTPLimiter from "../middlewares/otpLimiter.js";

const router = Router();

//Creates a profile of user
router.route("/signup").post(signupLimiter, validateSignup, handleUserSignup);

//Logs in the user and creates a session for them
router.route("/login").post(loginLimiter, validateLogin, handleUserLogin);

//Logs out the user and destroys their session
router.route("/logout").post(authenticateUser, handleUserLogout);

// Verifies the user's email using the token sent to their email
router.get("/verify-email/:token", verifyEmail);

// Forgot password routes
router.post("/forgot-password", OTPLimiter, handleForgotPassword);

// Verifies the OTP sent to the user's email for password reset
router.post("/verify-reset-otp", handleVerifyResetOTP);

// Resets the user's password after OTP verification
router.post("/reset-password", handleResetPassword);

export default router;
