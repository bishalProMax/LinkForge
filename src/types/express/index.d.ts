import type { TokenPayload } from "../auth.types.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: TokenPayload;

    rateLimit?: {
      resetTime: Date;
    };
  }
}

export {};

