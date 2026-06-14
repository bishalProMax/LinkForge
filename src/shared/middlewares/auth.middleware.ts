import asyncHandler from "../utils/asyncHandler.js";
import { verifyToken } from "../services/jwt.service.js";
import type { Request, Response, NextFunction } from "express";

const authenticateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userToken = req.cookies?.token;
  if (!userToken) return res.redirect("/login");
  const user = verifyToken(userToken);
  if (!user) return res.redirect("/login");
  req.user = user;
  next();
});

const redirectIfAuthenticated = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies?.token;
  if (!token) {
    return next();
  }

  const user = verifyToken(token);
  if (user) {
    return res.redirect("/dashboard");
  }

  next();
});


export { authenticateUser, redirectIfAuthenticated };
