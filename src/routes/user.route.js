const express = require("express")
const { handleUserSignup, handleUserLogin } = require('../controllers/User.controller.js')

const router = express.Router()

//Creates a profile of user
router.route('/signup').post(handleUserSignup)

router.route('/login').post(handleUserLogin)

module.exports = router