import express from "express";
import cookieParser from "cookie-parser";

export default function parserMiddleware(
    app: express.Application
) {
    app.use(express.json());

    app.use(
        express.urlencoded({
            extended: true,
        })
    );

    app.use(cookieParser());
}