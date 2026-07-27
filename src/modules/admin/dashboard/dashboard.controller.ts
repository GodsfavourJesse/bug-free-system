import { Request, Response, NextFunction } from "express";

import { dashboardService } from "./dashboard.service";

export class DashboardController {
    constructor() {
        this.getDashboard = 
            this.getDashboard.bind(this);
    }
    /**
     * GET /admin/dashboard
     */
    async getDashboard(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const data =
                await dashboardService.getDashboard();

            return res.status(200).json({
                success: true,
                data,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const dashboardController =
    new DashboardController();