import asyncHandler from "../utils/asyncHandler.js";
import { verifyToken, createToken, rotateRefreshSession, revokeAllUserSessions } from "../services/jwt.service.js";
import { accessTokenCookieOptions, refreshTokenCookieOptions } from "../utils/cookieOptions.js";
import { findUserById } from "../../modules/user/user.repository.js";
import type { Request, Response, NextFunction } from "express";

const authenticateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");

  const accessToken = req.cookies?.accessToken;

  if (accessToken) {
    const user = verifyToken(accessToken);
    if (user) {
      const currentUser = await findUserById(user.id);

      if (!currentUser || currentUser.isBanned) {
        if (currentUser?.isBanned) {
          await revokeAllUserSessions(user.id);
        }
        res.clearCookie("accessToken", accessTokenCookieOptions);
        res.clearCookie("refreshToken", refreshTokenCookieOptions);
        return res.redirect("/login");
      }

      req.user = user;
      return next();
    }
  }

  const refreshCookie = req.cookies?.refreshToken;
  if (!refreshCookie) return res.redirect("/login");

const rotated = await rotateRefreshSession(refreshCookie);

  if (!rotated) {
    res.clearCookie("accessToken", accessTokenCookieOptions);
    res.clearCookie("refreshToken", refreshTokenCookieOptions);
    return res.redirect("/login");
  }

  const currentUser = await findUserById(rotated.user._id.toString());

  if (!currentUser || currentUser.isBanned) {
    await revokeAllUserSessions(rotated.user._id.toString());
    res.clearCookie("accessToken", accessTokenCookieOptions);
    res.clearCookie("refreshToken", refreshTokenCookieOptions);
    return res.redirect("/login");
  }

  const newAccessToken = createToken(rotated.user);

  res.cookie("accessToken", newAccessToken, accessTokenCookieOptions);
  res.cookie("refreshToken", rotated.cookieValue, refreshTokenCookieOptions);

  req.user = {
    id: rotated.user._id.toString(),
    email: rotated.user.email,
    name: rotated.user.name,
    role: rotated.user.role,
  };

  next();
});

// Middleware to redirect authenticated users away from login/signup pages
const redirectIfAuthenticated = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  const accessToken = req.cookies?.accessToken;

  if (accessToken) {
    const user = verifyToken(accessToken);
    if (user) {
      return res.redirect("/dashboard");
    }
  }

  const refreshCookie = req.cookies?.refreshToken;
  if (!refreshCookie) {
    return next();
  }

  const rotated = await rotateRefreshSession(refreshCookie);

  if (!rotated) {
    res.clearCookie("accessToken", accessTokenCookieOptions);
    res.clearCookie("refreshToken", refreshTokenCookieOptions);
    return next();
  }

  const newAccessToken = createToken(rotated.user);
  res.cookie("accessToken", newAccessToken, accessTokenCookieOptions);
  res.cookie("refreshToken", rotated.cookieValue, refreshTokenCookieOptions);

  return res.redirect("/dashboard");
});

export {
  authenticateUser,
  redirectIfAuthenticated
};