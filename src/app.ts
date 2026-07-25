import express from "express";
import securityMiddleware from "./middlewares/security.middleware";
import parserMiddleware from "./middlewares/parser.middleware";
import loggerMiddleware from "./middlewares/logger.middleware";

import apiRoutes from "./routes/index";
import healthRoutes from "./health/health.routes";
import notFoundMiddleware from "./middlewares/notFound.middleware";
import errorMiddleware from "./middlewares/error.middleware";


const app = express();

// Security
securityMiddleware(app);

// Body Parsing
parserMiddleware(app);

// Logging
loggerMiddleware(app);

// Health Check
app.use("/health", healthRoutes);

// API Routes
app.use("/api/v1", apiRoutes);

// 404
app.use(notFoundMiddleware);

// Error Handler
app.use(errorMiddleware);

export default app;