const express = require("express")
const { handleUserSignup, handleUserLogin, handleUserLogout } = require('../controllers/User.controller.js')
const { validateSignup, validateLogin } = require("../middleware/validation.middleware");
const { restrictToLoggedInUserOnly } = require("../middleware/auth.middleware.js");
const { signupLimiter, loginLimiter } = require("../middleware/rateLimit.middleware.js");


const router = express.Router()

//Creates a profile of user
router.route('/signup').post(signupLimiter, validateSignup, handleUserSignup)

router.route('/login').post(loginLimiter, validateLogin, handleUserLogin)

router.route('/logout').post(restrictToLoggedInUserOnly, handleUserLogout)

module.exports = router