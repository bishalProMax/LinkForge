const express = require("express")
const {handleGetAllURL} = require("../controllers/url.controller.js")
const { handleShowSignupPage, handleShowLoginPage } = require("../controllers/static.controller.js")

const router = express.Router()



//SSR
router.route("/").get(handleGetAllURL)

router.route("/signup").get(handleShowSignupPage)

router.route("/login").get(handleShowLoginPage)

module.exports = router