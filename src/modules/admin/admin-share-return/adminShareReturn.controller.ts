import {
    Request,
    Response,
    NextFunction,
} from "express";
import { adminShareReturnEngine } from "./adminShareReturn.engine";



interface AdminShareReturnParams {
    id: string;
    purchaseId: string;
}


export class AdminShareReturnController {

    /**
     * POST /admin/shares/:id/purchasers/:purchaseId/return
     *
     * Manually credit an expired share purchase.
     *
     * Admin only.
     */
    async processReturn(
        req: Request<
            AdminShareReturnParams
        >,
        res: Response,
        next: NextFunction,
    ) {

        try {

            const {
                id,
                purchaseId,
            } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Share ID is required.",
                });
            }

            if (!purchaseId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Share purchase ID is required.",
                });
            }

            const result =
                await adminShareReturnEngine.processReturn(
                    purchaseId,
                );

            return res.status(200).json({
                success: true,
                message:
                    "Share return credited successfully.",
                data: result,
            });

        } catch (error) {

            next(error);

        }
    }
}


export const adminShareReturnController =
    new AdminShareReturnController();