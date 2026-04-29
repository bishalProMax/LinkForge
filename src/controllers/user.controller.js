const asyncHandler = require("../utils/asyncHandler.js");
const User = require("../models/user.models.js");
const { createToken } = require("../service/auth.service.js")

//SIGNUP
const handleUserSignup = asyncHandler(async (req,res) => {
    const { name, email, password } = req.body
    
    if (!name || !email || !password) {
        return res.status(400).send("All fields are required")
    }
    
    await User.create({
        name,
        email,
        password
    })
    return res.redirect("/login")
})

//LOGIN
const handleUserLogin = asyncHandler(async (req,res) => {
    const { email, password } = req.body
    
    if (!email || !password) {
        return res.status(400).send("All fields are required")
    }
    
    const user = await User.findOne({email,password})

    if (!user) return res.render('login', {error: "!! Invalid credentials !!"})

    const token = createToken(user)
    res.cookie("token", token,{
    httpOnly: true
})
    return res.redirect("/linkforge")
})

const handleUserLogout = (req, res) => {
    res.clearCookie("token",{
    httpOnly: true
    });
    return res.redirect("/login");
};

module.exports = {
    handleUserSignup,
    handleUserLogin,
    handleUserLogout
}