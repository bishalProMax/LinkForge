const express = require("express")
const { handleUserSignup } = require('../controllers/User.controller.js')

const router = express.Router()

//Creates a profile of user
router.route('/signup').post(handleUserSignup)

module.exports = router