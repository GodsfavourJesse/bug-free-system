import {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    adminShareAnalyticsService,
} from "./adminShareAnalytics.service";


interface AdminShareAnalyticsParams {
    id: string;
}


export class AdminShareAnalyticsController {

    /**
     * GET /admin/shares/:id/analytics
     *
     * Get financial analytics for a share.
     */
    async getAnalytics(
        req: Request<
            AdminShareAnalyticsParams
        >,
        res: Response,
        next: NextFunction,
    ) {

        try {

            const analytics =
                await adminShareAnalyticsService.getAnalytics(
                    req.params.id,
                );


            return res.status(200).json({

                success: true,

                data: analytics,

            });

        } catch (error) {

            next(error);

        }
    }
}


export const adminShareAnalyticsController =
    new AdminShareAnalyticsController();