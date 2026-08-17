import {
    Request,
    Response,
    NextFunction,
} from "express";

import { tokenService } from "../modules/token/token.service";
import { authRepository } from "../modules/auth/auth.repository";

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {

    try {
        const authHeader = req.headers.authorization;

        // Authorization header is required.
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization header is missing.",
            });
        }

        // Authorization must use Bearer format.
        if (
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format.",
            });
        }

        const token = authHeader.substring(7).trim();

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access token is missing.",
            });
        }

        // Verify access token.
        const payload = tokenService.verifyAccessToken(
            token,
        );

        // findUserById returns:
        //
        // {
        //     user,
        //     membership
        // }
        //
        // Therefore we must extract the actual
        // user object.
        const result = await authRepository.findUserById(
            payload.id,
        );

        if (!result) {
            return res.status(401).json({
                success: false,
                message: "User not found.",
            });
        }

        const user = result.user;

        // Check account status using the actual user.
        if (!user.isActive) {

            return res.status(403).json({
                success: false,
                message: "Account has been deactivated.",
            });
        }

        // Attach the actual user to req.user.
        req.user = user;

        next();

    } catch {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired access token.",
        });
    }
};