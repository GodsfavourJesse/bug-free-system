import {
    Request,
    Response,
    NextFunction,
} from "express";

import { completedAdvertisementService } from "./completedAdvertisement.service";

export class CompletedAdvertisementController {

    /**
     * Complete an advertisement.
     *
     * POST /completed-advertisements
     */
    complete = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const completion =
                await completedAdvertisementService.complete({
                    userId: req.user!.id,
                    advertisementId:
                        req.body.advertisementId,
                });

            res.status(201).json({
                success: true,
                message:
                    "Advertisement completed successfully.",
                data: completion,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get completed advertisements
     * for the authenticated user.
     *
     * GET /completed-advertisements
     */
    getUserCompleted = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const completed =
                await completedAdvertisementService.getUserCompleted(
                    req.user!.id,
                );

            res.status(200).json({
                success: true,
                message:
                    "Completed advertisements retrieved successfully.",
                data: completed,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Determine whether the authenticated
     * user has completed an advertisement.
     *
     * GET /completed-advertisements/:advertisementId
     */
    hasCompleted = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {

            const advertisementId = Array.isArray(req.params.advertisementId)
                ? req.params.advertisementId[0]
                : req.params.advertisementId;

            const completed =
                await completedAdvertisementService.hasCompleted(
                    req.user!.id,
                    advertisementId,
                );

            res.status(200).json({
                success: true,
                data: {
                    completed,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Count advertisement completions.
     *
     * GET /completed-advertisements/:advertisementId/count
     */
    countCompleted = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {

            const advertisementId = Array.isArray(req.params.advertisementId)
                ? req.params.advertisementId[0]
                : req.params.advertisementId;

            const count =
                await completedAdvertisementService.countCompleted(
                    advertisementId
                );

            res.status(200).json({
                success: true,
                data: {
                    count,
                },
            });
        } catch (error) {
            next(error);
        }
    };

}

export const completedAdvertisementController =
    new CompletedAdvertisementController();