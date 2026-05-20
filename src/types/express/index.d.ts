import type { TokenPayload } from "../auth.types.js";
import "express"; //module augmentation import not importing runtime Express object.

declare global {  //modify global TypeScript types used for declaring variables that are made by us not any library 
  namespace Express {  //modify Express types
    interface Request {  //Modifies Express Request interface globally.
      user?: TokenPayload;
    }
  }
}

declare module "express" {   //library module augmentation -> extending existing types
  interface Request {
    rateLimit?: {
      resetTime: Date;
    };
  }
}

export {};
