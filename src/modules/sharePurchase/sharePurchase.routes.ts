import { Router } from "express";

import {
    authenticate,
} from "../../middlewares/auth.middleware";

import {
    sharePurchaseController,
} from "./sharePurchase.controller";

const router = Router();

router.use(
    authenticate,
);

/**
 * Buy a share.
 *
 * POST /shares/:shareId/purchase
 */
router.post(
    "/:shareId/purchase",
    sharePurchaseController.purchase.bind(
        sharePurchaseController,
    ),
);

/**
 * Get authenticated user's
 * share purchases.
 *
 * GET /shares/purchases
 */
router.get(
    "/purchases",
    sharePurchaseController.getMyPurchases.bind(
        sharePurchaseController,
    ),
);

/**
 * Get one purchase.
 *
 * GET /shares/purchases/:id
 */
router.get(
    "/purchases/:id",
    sharePurchaseController.getPurchase.bind(
        sharePurchaseController,
    ),
);

export default router;