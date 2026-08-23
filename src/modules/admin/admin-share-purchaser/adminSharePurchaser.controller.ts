import {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    adminSharePurchaserService,
} from "./adminSharePurchaser.service";


interface AdminSharePurchaserParams {
    id: string;
}


interface AdminSharePurchaserQuery {
    page?: string;
    limit?: string;
}


export class AdminSharePurchaserController {

    /**
     * GET /admin/shares/:id/purchasers
     *
     * Get paginated purchasers for a share.
     */
    async getPurchasers(
        req: Request<
            AdminSharePurchaserParams,
            {},
            {},
            AdminSharePurchaserQuery
        >,
        res: Response,
        next: NextFunction,
    ) {

        try {

            const page =
                Number(
                    req.query.page ?? 1,
                );


            const limit =
                Number(
                    req.query.limit ?? 20,
                );


            const result =
                await adminSharePurchaserService.getPurchasers(
                    req.params.id,
                    page,
                    limit,
                );


            return res.status(200).json({

                success: true,

                ...result,

            });

        } catch (error) {

            next(error);

        }
    }
}


export const adminSharePurchaserController =
    new AdminSharePurchaserController();