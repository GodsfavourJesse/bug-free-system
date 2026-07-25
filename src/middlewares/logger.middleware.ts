import express from "express";
import morgan from "morgan";

export default function loggerMiddleware(
    app: express.Application
) {
    app.use(
        morgan("dev")
    );
}