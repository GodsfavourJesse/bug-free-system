import {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    sharePurchaseService,
} from "./sharePurchase.service";

import {
    BuyShareDto,
} from "./sharePurchase.dto";

interface SharePurchaseParams {
    shareId: string;
}

interface PurchaseIdParams {
    id: string;
}

export class SharePurchaseController {

    /**
     * POST /shares/:shareId/purchase
     */
    async purchase(
        req: Request<
            SharePurchaseParams,
            {},
            BuyShareDto
        >,
        res: Response,
        next: NextFunction,
    ) {
        try {

            const result =
                await sharePurchaseService.purchase(
                    req.user!.id,
                    req.params.shareId,
                    Number(req.body.amount),
                );

            return res.status(201).json({
                success: true,

                message:
                    "Share purchased successfully.",

                data: result,
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /shares/purchases
     */
    async getMyPurchases(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {

            const purchases =
                await sharePurchaseService.findByUser(
                    req.user!.id,
                );

            return res.status(200).json({
                success: true,

                data: purchases,
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /shares/purchases/:id
     */
    async getPurchase(
        req: Request<PurchaseIdParams>,
        res: Response,
        next: NextFunction,
    ) {
        try {

            const purchase =
                await sharePurchaseService.findById(
                    req.params.id,
                );

            return res.status(200).json({
                success: true,

                data: purchase,
            });

        } catch (error) {
            next(error);
        }
    }
}

export const sharePurchaseController =
    new SharePurchaseController();