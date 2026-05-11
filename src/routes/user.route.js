import { Router } from "express";
import { handleUserSignup, handleUserLogin, handleUserLogout, verifyEmail } from "../controllers/User.controller.js";
import { validateSignup, validateLogin } from "../middleware/validation.middleware.js";
import authenticateUser from "../middleware/auth.middleware.js";
import { signupLimiter, loginLimiter } from "../middleware/rateLimit.middleware.js";
import emailThrottle from "../middleware/emailThrottle.middleware.js";


const router = Router()

//Creates a profile of user
router.route('/signup').post(signupLimiter, validateSignup, handleUserSignup)

//Logs in the user and creates a session for them
router.route('/login').post(emailThrottle,loginLimiter, validateLogin, handleUserLogin) 

//Logs out the user and destroys their session
router.route('/logout').post(authenticateUser, handleUserLogout)

// Verifies the user's email using the token sent to their email
router.get("/verify-email/:token",verifyEmail);

export default router;