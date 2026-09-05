import type { Request } from "express";

const getRateLimitRetryTime = (req: Request): number => {
  return Math.ceil(
    (
      req.rateLimit!.resetTime.getTime() - Date.now()  
    ) / 1000
  );
};

export default getRateLimitRetryTime;
