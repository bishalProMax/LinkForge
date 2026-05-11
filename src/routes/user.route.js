const express = require("express")
const { handleUserSignup, handleUserLogin, handleUserLogout, verifyEmail } = require('../controllers/User.controller.js')
const { validateSignup, validateLogin } = require("../middleware/validation.middleware");
const { authenticateUser } = require("../middleware/auth.middleware.js");
const { signupLimiter, loginLimiter } = require("../middleware/rateLimit.middleware.js");
const { emailThrottle } = require("../middleware/emailThrottle.middleware.js");


const router = express.Router()

//Creates a profile of user
router.route('/signup').post(signupLimiter, validateSignup, handleUserSignup)

//Logs in the user and creates a session for them
router.route('/login').post(emailThrottle,loginLimiter, validateLogin, handleUserLogin) 

//Logs out the user and destroys their session
router.route('/logout').post(authenticateUser, handleUserLogout)

// Verifies the user's email using the token sent to their email
router.get("/verify-email/:token",verifyEmail);

module.exports = router