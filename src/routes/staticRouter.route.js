const express = require("express")
const {handleGetAllURL} = require("../controllers/url.controller.js")
const { handleShowSignupPage, handleShowLoginPage } = require("../controllers/static.controller.js")
const { authenticateUser }  = require("../middleware/auth.middleware.js")
const router = express.Router()



//SSR
router.route("/linkforge").get(authenticateUser,handleGetAllURL)

router.route("/signup").get(handleShowSignupPage)

router.route("/login").get(handleShowLoginPage)

module.exports = router