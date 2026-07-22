 // GLOBAL ERROR HANDLER
import { Request, Response, NextFunction } from "express"; 
import logger from "../../infrastructure/configs/logger.config.js"; 


const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction): void => {
    logger.error({ err, requestId: req.id, path: req.path, method: req.method }, "Unhandled error");
    res.status(500).send("Internal Server Error");
}

// 404 HANDLER
const notFound = (req: Request, res: Response): void => {
    logger.warn({ path: req.path, method: req.method }, "Route not found");
    res.status(404).send("Page not found");
}


export {
    errorHandler,
    notFound,
};