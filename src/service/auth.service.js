const jwt = require("jsonwebtoken")

function createToken(user){
    const payload = {
        id: user._id,
        email: user.email,
    }
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES || "1d"
    })
}

function verifyToken(token){
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        return {
            id: decoded.id,
            email: decoded.email
        }
    } catch (error) {
        return null
    }
}


module.exports = {
    createToken,
    verifyToken
}