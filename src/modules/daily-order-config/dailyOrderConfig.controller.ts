import { Request, Response } from "express";
import { dailyOrderConfigService } from "./dailyOrderConfig.service";

export class AdminDailyOrderConfigController {

    /**
     * Return every daily order configuration.
     */
    async findAll(
        req: Request,
        res: Response,
    ) {
        const configs =
            await dailyOrderConfigService.findAll();

        return res.status(200).json({
            success: true,
            data: configs,
        });
    }

    /**
     * Return one daily order configuration.
     */
    async findById(
        req: Request,
        res: Response,
    ) {
        const configId =
            Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;

        const config =
            await dailyOrderConfigService.findById(
                configId,
            );

        return res.status(200).json({
            success: true,
            data: config,
        });
    }

    /**
     * Create a new daily order configuration.
     */
    async create(
        req: Request,
        res: Response,
    ) {
        const config =
            await dailyOrderConfigService.create(
                req.body,
            );

        return res.status(201).json({
            success: true,
            message:
                "Daily order configuration created successfully.",
            data: config,
        });
    }

    /**
     * Update a daily order configuration.
     */
    async update(
        req: Request,
        res: Response,
    ) {
        const configId =
            Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;

        const config =
            await dailyOrderConfigService.update(
                configId,
                req.body,
            );

        return res.status(200).json({
            success: true,
            message:
                "Daily order configuration updated successfully.",
            data: config,
        });
    }

    /**
     * Delete a daily order configuration.
     */
    async delete(
        req: Request,
        res: Response,
    ) {
        const configId =
            Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;

        await dailyOrderConfigService.delete(
            configId,
        );

        return res.status(200).json({
            success: true,
            message:
                "Daily order configuration deleted successfully.",
        });
    }

    /**
     * Activate a configuration.
     */
    async activate(
        req: Request,
        res: Response,
    ) {
        const configId =
            Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;

        const config =
            await dailyOrderConfigService.activate(
                configId,
            );

        return res.status(200).json({
            success: true,
            message:
                "Daily order configuration activated successfully.",
            data: config,
        });
    }

    /**
     * Deactivate a configuration.
     */
    async deactivate(
        req: Request,
        res: Response,
    ) {
        const configId =
            Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;

        const config =
            await dailyOrderConfigService.deactivate(
                configId,
            );

        return res.status(200).json({
            success: true,
            message:
                "Daily order configuration deactivated successfully.",
            data: config,
        });
    }
}

export const adminDailyOrderConfigController =
    new AdminDailyOrderConfigController();