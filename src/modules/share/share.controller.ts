import {
    Request,
    Response,
    NextFunction,
} from "express";

import { shareService } from "./share.service";
import { ShareStatus } from "../../database/enums/share.enum";

interface ShareIdParams {
    id: string;
}

interface ShareQuery {
    page?: string;
    limit?: string;
    status?: string;
    search?: string;
}

export class ShareController {

    // GET /shares
    // Authenticated users can view shares.
    async getShares(
        req: Request<
            {},
            {},
            {},
            ShareQuery
        >,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const page = Number(req.query.page ?? 1);
            const limit = Number(req.query.limit ?? 20);

            const status = req.query.status
                ? req.query.status as ShareStatus
                : undefined;

            const result = await shareService.findAll({
                page,
                limit,
                status,
                search: req.query.search,
            });

            return res.status(200).json({
                success: true,
                ...result,
            });

        } catch (error) {
            next(error);
        }
    }


    // GET /shares/:id
    // Authenticated users can view an individual share.
    async getShare(
        req: Request<ShareIdParams>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const share = await shareService.findById(
                req.params.id,
            );

            return res.status(200).json({
                success: true,
                data: share,
            });

        } catch (error) {
            next(error);
        }
    }
}

export const shareController = new ShareController();