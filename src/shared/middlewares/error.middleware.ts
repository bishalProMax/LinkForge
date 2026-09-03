// GLOBAL ERROR HANDLER
import multer from "multer";
import { Request, Response, NextFunction } from "express";
import logger from "../../infrastructure/configs/logger.config.js";

const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction): void => {
  logger.error({ err, requestId: req.id, path: req.path, method: req.method }, "Unhandled error" );

  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ message: "File size cannot exceed 2 MB." });
      return;
    }

    res.status(400).json({ message: err.message });
    return;
  }

  // Custom fileFilter error
  if (err instanceof Error) {
    if (err.message === "Only CSV files are accepted.") {
      res.status(400).json({ message: err.message });
      return;
    }
  }

  // Other unexpected errors
  res.status(500).json({ message: "Internal Server Error" });
};

// 404 HANDLER
const notFound = (req: Request, res: Response): void => {
  logger.warn({ path: req.path, method: req.method }, "Route not found");
  res.status(404).send("Page not found");
};

export { 
    errorHandler, 
    notFound 
    };
