import asyncHandler from "../utils/asyncHandler.js";
import { verifyToken } from "../services/auth.service.js";

const authenticateUser = asyncHandler(async (req, res, next) => {
    const userToken = req.cookies?.token;
    if (!userToken) return res.redirect("/login")
    const user = verifyToken(userToken)
    if (!user) return res.redirect("/login")
    req.user = user;
    next();
});

export default authenticateUser;
