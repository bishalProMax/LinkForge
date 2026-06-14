/* eslint-disable no-unused-vars */
// GLOBAL ERROR HANDLER
import { Request, Response, NextFunction } from "express";  


const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction): void => {
    console.error("ERROR:", err)
    res.status(500).send("Internal Server Error")
}

// 404 HANDLER
const notFound = (req: Request, res: Response): void => {
    res.status(404).send("Page not found")
}


export {
  errorHandler,
  notFound,
};