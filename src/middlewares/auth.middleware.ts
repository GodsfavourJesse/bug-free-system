import { Request, Response, NextFunction } from "express";
import { tokenService } from "../modules/token/token.service";
import { authRepository } from "../modules/auth/auth.repository";

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization header is missing.",
            });
        }

        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format.",
            });
        }

        const token = authHeader.split(" ")[1];

        const payload = tokenService.verifyAccessToken(token);

        const user = await authRepository.findUserById(payload.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found.",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account has been deactivated.",
            });
        }

        req.user = user;

        next();

    } catch {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired access token.",
        });
    }
};