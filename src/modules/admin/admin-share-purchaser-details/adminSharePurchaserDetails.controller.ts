import {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    adminSharePurchaserDetailsService,
} from "./adminSharePurchaserDetails.service";

interface AdminSharePurchaserDetailsParams {
    id: string;
    purchaseId: string;
}


export class AdminSharePurchaserDetailsController {

    /**
     * GET /admin/shares/:id/purchasers/:purchaseId
     *
     * Get one purchaser's details.
     */
    async getPurchaserDetails(
        req: Request<
            AdminSharePurchaserDetailsParams
        >,
        res: Response,
        next: NextFunction,
    ) {

        try {

            const result =
                await adminSharePurchaserDetailsService
                    .getPurchaseDetails(
                        req.params.id,
                        req.params.purchaseId,
                    );


            return res.status(200).json({

                success: true,

                data:
                    result.data,

            });

        } catch (error) {

            next(error);

        }
    }
}

export const adminSharePurchaserDetailsController =
    new AdminSharePurchaserDetailsController();