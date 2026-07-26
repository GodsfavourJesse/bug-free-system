import "dotenv/config";

import app from "./app";
import { db } from "./database";

const PORT = Number(process.env.PORT) || 5000;

console.log("DATABASE_URL:", process.env.DATABASE_URL);

async function startServer() {
    try {

        // Test PostgreSQL connection
        await db.execute("SELECT 1");

        console.log("✅ PostgreSQL connected");

        app.listen(PORT, () => {
            console.log(
                `🚀 Server running on http://localhost:${PORT}`
            );
        });

    } catch (error) {

        console.error(
            "❌ Failed to start server:",
            error
        );

        process.exit(1);
    }
}

startServer();