const express = require("express")
const {handleGetAllURL} = require("../controllers/url.controller.js")

const router = express.Router()

//SSR
router.route("/test").get(handleGetAllURL)



module.exports = router