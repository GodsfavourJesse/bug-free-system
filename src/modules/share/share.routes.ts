import { Router } from "express";

import {
    authenticate,
} from "../../middlewares/auth.middleware";

import {
    shareController,
} from "./share.controller";

import {
    sharePurchaseController,
} from "../sharePurchase/sharePurchase.controller";


const router = Router();


/**
 * =========================================================
 * AUTHENTICATION
 * =========================================================
 */

router.use(
    authenticate,
);


/**
 * =========================================================
 * USER SHARE PURCHASES
 * =========================================================
 */

/**
 * GET /shares/purchases
 *
 * Get authenticated user's purchases.
 */
router.get(
    "/purchases",
    sharePurchaseController.getMyPurchases.bind(
        sharePurchaseController,
    ),
);


/**
 * GET /shares/purchases/:id
 *
 * Get one authenticated user's purchase.
 */
router.get(
    "/purchases/:id",
    sharePurchaseController.getPurchase.bind(
        sharePurchaseController,
    ),
);


/**
 * POST /shares/:shareId/purchase
 *
 * Purchase a share.
 */
router.post(
    "/:shareId/purchase",
    sharePurchaseController.purchase.bind(
        sharePurchaseController,
    ),
);


/**
 * =========================================================
 * USER SHARE DISCOVERY
 * =========================================================
 */

/**
 * GET /shares
 *
 * List shares available to users.
 */
router.get(
    "/",
    shareController.getShares.bind(
        shareController,
    ),
);


/**
 * GET /shares/:id
 *
 * View one share.
 */
router.get(
    "/:id",
    shareController.getShare.bind(
        shareController,
    ),
);


export default router;