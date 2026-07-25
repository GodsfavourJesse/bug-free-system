import {
    Request,
    Response,
    NextFunction,
} from "express";

import { authService } from "./auth.service";

class AuthController {

    /**
     * Register User
     */
    async register(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {

            const result =
                await authService.register(req.body);

            return res.status(201).json({
                success: true,
                message: "Registration successful.",
                data: result,
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * User Login
     */
    async login(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {

            const result =
                await authService.login(req.body);

            return res.status(200).json({
                success: true,
                message: "Login successful.",
                data: result,
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Admin Login
     */
    async adminLogin(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {

            const result =
                await authService.adminLogin(req.body);

            return res.status(200).json({
                success: true,
                message: "Admin login successful.",
                data: result,
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Refresh Token
     */
    async refresh(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {

            const { refreshToken } = req.body;

            const result =
                await authService.refresh(refreshToken);

            return res.status(200).json({
                success: true,
                message: "Token refreshed successfully.",
                data: result,
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Logout
     */
    async logout(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {

            const { refreshToken } = req.body;

            const result =
                await authService.logout(refreshToken);

            return res.status(200).json({
                success: true,
                message: result.message,
            });

        } catch (error) {
            next(error);
        }
    }

     /**
     * Current Authenticated User
     */
    async me(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const user = await authService.me(req.user.id);

            return res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();