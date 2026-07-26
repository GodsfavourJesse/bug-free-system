import { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "../config";


export default function securityMiddleware(
    app: Express
) {
    app.use(helmet());

    app.use(
        cors({
            origin(origin, callback) {
                // Allow Postman, mobile apps, curl, etc.
                if (!origin) {
                    return callback(null, true);
                }

                if (env.client.urls.includes(origin)) {
                    return callback(null, true);
                }

                return callback(
                    new Error("Origin not allowed by CORS")
                );
            },

            credentials: true,
        })
    );
}