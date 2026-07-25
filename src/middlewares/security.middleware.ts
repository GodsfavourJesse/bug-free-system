import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

export default function securityMiddleware(
    app: express.Application
) {
    app.use(helmet());

    app.use(
        cors({
            origin: process.env.CLIENT_URL,
            credentials: true,
        })
    );

    app.use(compression());
}