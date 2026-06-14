import { Router } from "express";
import passport from "passport";
import { handleUserSignup, handleUserLogin, handleUserLogout, verifyEmail } from "./auth.controller.js";
import { validateSignup, validateLogin } from "../../shared/middlewares/validation.middleware.js";
import { authenticateUser } from "../../shared/middlewares/auth.middleware.js";
import { signupLimiter, loginLimiter } from "../../shared/middlewares/authRateLimit.middleware.js";
import { handleForgotPassword, handleVerifyResetOTP, handleResetPassword } from "./password.controller.js";
import OTPLimiter from "../../shared/middlewares/otpLimiter.middleware.js";
import { createToken } from "../../shared/services/jwt.service.js";
import cookieOptions from "../../shared/utils/cookieOptions.js";

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

// GOOGLE AUTH
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// GOOGLE CALLBACK
router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  async (req, res) => {
    const user = req.user as any;

    const token = createToken(user);
    res.cookie("token", token, cookieOptions);
    res.redirect("/dashboard");
  }
);

export default router;
