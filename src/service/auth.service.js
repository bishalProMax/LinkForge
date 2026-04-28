const jwt = require("jsonwebtoken")

function createToken(user){
    const payload = {
        id: user._id,
        email: user.email,
    }
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d"
    })
}

function verifyToken(token){
    try {
        return jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        return null
    }
}


module.exports = {
    createToken,
    verifyToken
}