const asyncHandler = require("../utils/asyncHandler.js");
const { verifyToken } = require("../service/auth.service.js");

const restrictToLoggedInUserOnly = asyncHandler(async (req, res, next) => {
    const userToken = req.cookies?.token;
    if (!userToken) return res.redirect("/login")
    const user = verifyToken(userToken)
    if (!user) return res.redirect("/login")
    req.user = user;
    next();
});

const checkAuth = asyncHandler(async (req, res, next) => {
    const userToken = req.cookies?.token;
    const user = verifyToken(userToken)
    req.user = user;
    next();
})


module.exports = { restrictToLoggedInUserOnly, checkAuth }
