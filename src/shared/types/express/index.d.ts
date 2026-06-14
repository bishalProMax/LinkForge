import type { TokenPayload } from "../jwt.types.ts";

declare module "express-serve-static-core" {
  interface Request {
    user?: TokenPayload;

    rateLimit?: {
      resetTime: Date;
    };
  }
}

export {};

