const express = require("express")
const {handleGetAllURL} = require("../controllers/url.controller.js")
const { handleShowSignupPage } = require("../controllers/static.controller.js")

const router = express.Router()



//SSR
router.route("/").get(handleGetAllURL)

router.route("/signup").get(handleShowSignupPage)

module.exports = router