const asyncHandler = require("../utils/asyncHandler.js");
const User = require("../models/user.models.js");

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
    return res.redirect("/")
})

module.exports = {
    handleUserSignup
}