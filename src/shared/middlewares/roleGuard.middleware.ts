import type { Request, Response, NextFunction } from "express";
import type { TokenPayload } from "../types/jwt.types.js";

const requireRole = (...allowedRoles: TokenPayload["role"][]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.redirect("/login");
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).send("Forbidden: insufficient permissions");
      return;
    }

    next();
  };
};

export default requireRole;