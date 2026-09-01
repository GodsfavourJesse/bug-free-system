// corporate.controller.ts

import {
    Request,
    Response,
} from "express";

import {
    corporateService,
} from "./corporate.service";

export class CorporateController {

    async getUserAnnouncements(
        req: Request,
        res: Response,
    ) {
        const announcements =
            await corporateService.getUserAnnouncements(
                req.user!.id,
            );

        return res.json({
            success: true,
            data: announcements,
        });
    }

    async markAsRead(
        req: Request,
        res: Response,
    ) {
        const id =
            Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;

        await corporateService.markAsRead(
            id,
            req.user!.id,
        );

        return res.json({
            success: true,
            message:
                "Corporate announcement marked as read.",
        });
    }
}

export const corporateController =
    new CorporateController();