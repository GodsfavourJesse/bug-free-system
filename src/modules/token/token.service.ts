import jwt, { Secret, SignOptions } from "jsonwebtoken";

export interface JwtPayload {
    id: string;
    role: "admin" | "user";
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
}

export class TokenService {

    private readonly jwtSecret: Secret;
    private readonly jwtRefreshSecret: Secret;

    private readonly accessExpiresIn: SignOptions["expiresIn"];
    private readonly refreshExpiresIn: SignOptions["expiresIn"];

    constructor() {

        const jwtSecret = process.env.JWT_SECRET;
        const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

        if (!jwtSecret) {
            throw new Error("JWT_SECRET is missing.");
        }

        if (!jwtRefreshSecret) {
            throw new Error("JWT_REFRESH_SECRET is missing.");
        }

        this.jwtSecret = jwtSecret;
        this.jwtRefreshSecret = jwtRefreshSecret;
        this.accessExpiresIn =
            (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "2h";

        this.refreshExpiresIn =
            (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"]) || "7d";
    }

    /**
     * Build JWT Payload
     */
    buildPayload(user: {
        id: string;
        role: "admin" | "user";
    }): JwtPayload {

        return {
            id: user.id,
            role: user.role,
        };
    }

    /**
     * Generate Access Token
     */
    generateAccessToken(payload: JwtPayload): string {

        return jwt.sign(payload, this.jwtSecret, {
            expiresIn: this.accessExpiresIn,
        });
    }

    /**
     * Generate Refresh Token
     */
    generateRefreshToken(payload: JwtPayload): string {

        return jwt.sign(payload, this.jwtRefreshSecret, {
            expiresIn: this.refreshExpiresIn,
        });
    }

    /**
     * Generate Token Pair
     */
    generateTokens(user: {
        id: string;
        role: "admin" | "user";
    }): TokenPair {

        const payload = this.buildPayload(user);

        return {
            accessToken: this.generateAccessToken(payload),
            refreshToken: this.generateRefreshToken(payload),
            refreshTokenExpiresAt: this.calculateRefreshTokenExpiry(),
        };
    }

    /**
     * Verify Access Token
     */
    verifyAccessToken(token: string): JwtPayload {

        return jwt.verify(
            token,
            this.jwtSecret
        ) as JwtPayload;
    }

    /**
     * Verify Refresh Token
     */
    verifyRefreshToken(token: string): JwtPayload {

        return jwt.verify(
            token,
            this.jwtRefreshSecret
        ) as JwtPayload;
    }

    /**
     * Calculate Refresh Token Expiry
     */
    calculateRefreshTokenExpiry(): Date {

        const expiresAt = new Date();

        expiresAt.setDate(expiresAt.getDate() + 7);

        return expiresAt;
    }

    decodeToken(token: string) {
        return jwt.decode(token);
    }

    isExpired(date: Date): boolean {
        return date.getTime() < Date.now();
    }
}

export const tokenService = new TokenService();