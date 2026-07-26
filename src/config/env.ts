// Environment Configuration
// Loads and validates every required
// environment variable at application startup.

const requireEnv = (
    key: string,
): string => {

    const value = process.env[key];

    if (!value) {
        throw new Error(
            `Missing required environment variable: ${key}`,
        );
    }

    return value;
};

export const env = {

    server: {
        port: Number(
            process.env.PORT ?? 5000,
        ),

        nodeEnv: process.env.NODE_ENV ?? "development",
    },

    database: {
        url: requireEnv(
            "DATABASE_URL",
        ),
    },

    jwt: {
        secret: requireEnv(
            "JWT_SECRET",
        ),

        refreshSecret: requireEnv(
            "JWT_REFRESH_SECRET",
        ),

        expiresIn: process.env.JWT_EXPIRES_IN ?? "15m",

        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
    },

    client: {
        url: process.env.CLIENT_URL ??
            "https://nexus-apd.vercel.app",
    },

    admin: {
        email: requireEnv(
            "ADMIN_EMAIL",
        ),

        phone: requireEnv(
            "ADMIN_PHONE",
        ),

        password: requireEnv(
            "ADMIN_PASSWORD",
        ),

        referralCode: requireEnv(
            "ADMIN_REFERRAL_CODE",
        ),
    },

    cloudinary: {
        cloudName: requireEnv(
            "CLOUDINARY_CLOUD_NAME",
        ),

        apiKey: requireEnv(
            "CLOUDINARY_API_KEY",
        ),

        apiSecret: requireEnv(
            "CLOUDINARY_API_SECRET",
        ),
    },
};