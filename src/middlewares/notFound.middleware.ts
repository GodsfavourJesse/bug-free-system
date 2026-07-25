import { Request, Response, NextFunction } from "express";

export default function notFoundMiddleware(
    req:Request,
    res:Response,
    next:NextFunction
){
    res.status(404).json({
        success:false,
        message: `Cannot ${req.method} ${req.originalUrl}`

    });
}