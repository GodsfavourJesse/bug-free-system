import { Request, Response } from "express";

import { adminUpgradeService } from "./adminUpgrade.service";

export class AdminUpgradeController {

    // POST /admin/upgrade-requests/:id/review
    async markUnderReview(
        req: Request,
        res: Response,
    ) {
        const requestId = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;

        const reviewedBy = req.user!.id;

        const request = await adminUpgradeService.markUnderReview(
            requestId,
            reviewedBy,
        );

        return res.json({
            success: true,
            message:
                "Upgrade request marked as under review.",
            data: request,
        });
    }

    // Approve an upgrade request.
    async approve(
        req: Request,
        res: Response,
    ) {
        const request = await adminUpgradeService.approve(
            req.params.id as string,
            req.user!.id,
            req.body.adminNote,
        );

        return res.json({
            success: true,
            message:
                "Upgrade request approved successfully.",
            data: request,
        });
    }

    // Reject an upgrade request.
    async reject(
        req: Request,
        res: Response,
    ) {
        const request = await adminUpgradeService.reject(
            req.params.id as string,
            req.user!.id,
            req.body.rejectedReason,
            req.body.adminNote,
        );

        return res.json({
            success: true,
            message:
                "Upgrade request rejected successfully.",
            data: request,
        });
    }
}

export const adminUpgradeController =
    new AdminUpgradeController();