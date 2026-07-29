import { Request, Response, NextFunction } from "express";

import { advertisementService } from "./advertisement.service";

interface AdvertisementParams {
    id: string;
}

export class AdvertisementController {

    // Get all advertisements.
    getAdvertisements = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const advertisements =
                await advertisementService.getAdvertisements();

            res.status(200).json({
                success: true,
                message: "Advertisements retrieved successfully.",
                data: advertisements,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get one advertisement.
        async getAdvertisement(
        req: Request<AdvertisementParams>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const advertisement =
                await advertisementService.getAdvertisement(
                    req.params.id,
                );

            res.status(200).json({
                success: true,
                message: "Advertisement retrieved successfully.",
                data: advertisement,
            });
        } catch (error) {
            next(error);
        }
    }

    // Create advertisement.
    createAdvertisement = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const advertisement =
                await advertisementService.create({
                    ...req.body,
                    createdBy: req.user!.id,
                });

            res.status(201).json({
                success: true,
                message: "Advertisement created successfully.",
                data: advertisement,
            });
        } catch (error) {
            next(error);
        }
    }

    // Update advertisement.
    updateAdvertisement = async (
        req: Request<AdvertisementParams>,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const advertisement =
                await advertisementService.update(
                    req.params.id,
                    req.body,
                );

            res.status(200).json({
                success: true,
                message: "Advertisement updated successfully.",
                data: advertisement,
            });
        } catch (error) {
            next(error);
        }
    }

    // Archive advertisement.
    async deleteAdvertisement(
        req: Request<AdvertisementParams>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const advertisement =
                await advertisementService.delete(
                    req.params.id,
                );

            res.status(200).json({
                success: true,
                message: "Advertisement archived successfully.",
                data: advertisement,
            });
        } catch (error) {
            next(error);
        }
    }

    // Activate advertisement.
    async activateAdvertisement(
        req: Request<AdvertisementParams>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const advertisement =
                await advertisementService.activate(
                    req.params.id,
                );

            res.status(200).json({
                success: true,
                message: "Advertisement activated successfully.",
                data: advertisement,
            });
        } catch (error) {
            next(error);
        }
    }

    // Deactivate advertisement.
    async deactivateAdvertisement(
        req: Request<AdvertisementParams>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const advertisement =
                await advertisementService.deactivate(
                    req.params.id,
                );

            res.status(200).json({
                success: true,
                message: "Advertisement deactivated successfully.",
                data: advertisement,
            });
        } catch (error) {
            next(error);
        }
    }

    // Publish advertisement.
    async publishAdvertisement(
        req: Request<AdvertisementParams>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const advertisement =
                await advertisementService.publish(
                    req.params.id,
                );

            res.status(200).json({
                success: true,
                message: "Advertisement published successfully.",
                data: advertisement,
            });
        } catch (error) {
            next(error);
        }
    }

    // Archive advertisement.
    async archiveAdvertisement(
        req: Request<AdvertisementParams>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const advertisement =
                await advertisementService.deactivate(
                    req.params.id,
                );

            res.status(200).json({
                success: true,
                message: "Advertisement archived successfully.",
                data: advertisement,
            });
        } catch (error) {
            next(error);
        }
    }

}

export const advertisementController =
    new AdvertisementController();