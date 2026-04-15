const express = require("express")
const {handleGenerateNewShortURL, redirectToURL, handleGetAnalytics} = require("../controllers/url.controller.js")

const router = express.Router()

//IT GENERATE SHORT URL
router.route("/generate").post(handleGenerateNewShortURL)

//IT REDIRECT TO THE URL CREATED
router.route("/redirect/:shortId").get(redirectToURL)

//GENERATE THE ANALYTICS OF URL
router.route("/analytics/:shortId").get(handleGetAnalytics)


module.exports = router