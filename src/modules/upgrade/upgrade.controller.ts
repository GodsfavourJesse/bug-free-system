import { Request, Response } from "express";

import { upgradeService } from "./upgrade.service";

/**
 * Upgrade Request Controller
 *
 * Handles HTTP requests only.
 * Business logic belongs to the service layer.
 */
export class UpgradeController {

    /**
     * POST /upgrade-requests
     *
     * Create a new upgrade request.
     */
    async requestUpgrade(
        req: Request,
        res: Response,
    ) {
        const userId = req.user!.id;

        const request = await upgradeService.requestUpgrade(
            userId,
            {
                requestedMembershipPlanId:
                    req.body.requestedMembershipPlanId,

                paymentMethod:
                    req.body.paymentMethod,

                paymentProof:
                    req.body.paymentProof,

                metadata:
                    req.body.metadata,
            },
        );

        return res.status(201).json({
            success: true,
            message:
                "Upgrade request submitted successfully.",
            data: request,
        });
    }

    /**
     * DELETE /upgrade-requests/:id
     *
     * Cancel an upgrade request.
     */
    async cancelRequest(
        req: Request,
        res: Response,
    ) {
        const request =
            await upgradeService.cancelRequest(
                req.params.id as string,
                req.user!.id,
            );

        return res.json({
            success: true,
            message:
                "Upgrade request cancelled successfully.",
            data: request,
        });
    }

    /**
     * GET /upgrade-requests
     *
     * Return authenticated user's
     * upgrade requests.
     */
    async findByUser(
        req: Request,
        res: Response,
    ) {
        const requests =
            await upgradeService.findByUser(
                req.user!.id,
            );

        return res.json({
            success: true,
            data: requests,
        });
    }

    /**
     * GET /upgrade-requests/:id
     *
     * Return a single upgrade request.
     */
    async findById(
        req: Request,
        res: Response,
    ) {
        const request =
            await upgradeService.findById(
                req.params.id as string,
            );

        return res.json({
            success: true,
            data: request,
        });
    }

    /**
     * GET /upgrade-requests/pending
     *
     * Return all pending upgrade requests.
     *
     * (Admin routes will later replace this,
     * but included for this phase.)
     */
    async findPending(
        req: Request,
        res: Response,
    ) {
        const requests =
            await upgradeService.findPending();

        return res.json({
            success: true,
            data: requests,
        });
    }
}

export const upgradeController =
    new UpgradeController();