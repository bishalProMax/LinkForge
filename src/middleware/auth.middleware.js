const asyncHandler = require("../utils/asyncHandler.js");
const { verifyToken } = require("../service/auth.service.js");

const authenticateUser = asyncHandler(async (req, res, next) => {
    const userToken = req.cookies?.token;
    if (!userToken) return res.redirect("/login")
    const user = verifyToken(userToken)
    if (!user) return res.redirect("/login")
    req.user = user;
    next();
});

module.exports = { authenticateUser }
