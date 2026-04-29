const express = require("express")
const { handleUserSignup, handleUserLogin, handleUserLogout } = require('../controllers/User.controller.js')

const router = express.Router()

//Creates a profile of user
router.route('/signup').post(handleUserSignup)

router.route('/login').post(handleUserLogin)

router.route('/logout').post(handleUserLogout)

module.exports = router