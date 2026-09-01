import {
    Request,
    Response,
} from "express";

import {
    corporateService,
} from "../../corporate/corporate.service";


export class AdminCorporateController {

    // ========================================================
    // GET ALL ANNOUNCEMENTS
    // ========================================================

    async getAll(
        req: Request,
        res: Response,
    ) {

        const announcements =
            await corporateService
                .getAllAnnouncements();

        return res.json({
            success: true,
            data: announcements,
        });
    }


    // ========================================================
    // GET ONE ANNOUNCEMENT
    // ========================================================

    async getOne(
        req: Request,
        res: Response,
    ) {

        const id =
            Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;

        const announcement =
            await corporateService
                .getAnnouncement(id);

        return res.json({
            success: true,
            data: announcement,
        });
    }


    // ========================================================
    // CREATE ANNOUNCEMENT
    // ========================================================

    async create(
        req: Request,
        res: Response,
    ) {

        const announcement =
            await corporateService
                .createAnnouncement(
                    req.user!.id,
                    req.body,
                );

        return res.status(201).json({
            success: true,
            message:
                "Corporate announcement created successfully.",
            data: announcement,
        });
    }


    // ========================================================
    // UPDATE ANNOUNCEMENT
    // ========================================================

    async update(
        req: Request,
        res: Response,
    ) {

        const id =
            Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;

        const announcement =
            await corporateService
                .updateAnnouncement(
                    id,
                    req.body,
                );

        return res.json({
            success: true,
            message:
                "Corporate announcement updated successfully.",
            data: announcement,
        });
    }


    // ========================================================
    // PUBLISH ANNOUNCEMENT
    // ========================================================

    async publish(
        req: Request,
        res: Response,
    ) {

        const id =
            Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;

        const announcement =
            await corporateService
                .publish(id);

        return res.json({
            success: true,
            message:
                "Corporate announcement published successfully.",
            data: announcement,
        });
    }


    // ========================================================
    // UNPUBLISH ANNOUNCEMENT
    // ========================================================

    async unpublish(
        req: Request,
        res: Response,
    ) {

        const id =
            Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;

        const announcement =
            await corporateService
                .unpublish(id);

        return res.json({
            success: true,
            message:
                "Corporate announcement unpublished successfully.",
            data: announcement,
        });
    }


    // ========================================================
    // DELETE ANNOUNCEMENT
    // ========================================================

    async delete(
        req: Request,
        res: Response,
    ) {

        const id =
            Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;

        await corporateService
            .deleteAnnouncement(id);

        return res.json({
            success: true,
            message:
                "Corporate announcement deleted successfully.",
        });
    }
}


// ============================================================
// CONTROLLER INSTANCE
// ============================================================

export const adminCorporateController =
    new AdminCorporateController();