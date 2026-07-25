import jwt, { Secret, SignOptions } from "jsonwebtoken";

export interface JwtPayload {
    id: string;
    email: string;
    role: "admin" | "user";
}

const JWT_SECRET: Secret = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET: Secret = process.env.JWT_REFRESH_SECRET!;

const ACCESS_EXPIRES_IN =
    (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "15m";

const REFRESH_EXPIRES_IN =
    (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"]) || "7d";

export const generateAccessToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: ACCESS_EXPIRES_IN,
    });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: REFRESH_EXPIRES_IN,
    });
};

export const verifyAccessToken = (token: string): JwtPayload => {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
};