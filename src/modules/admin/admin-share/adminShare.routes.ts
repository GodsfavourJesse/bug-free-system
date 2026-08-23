import { Router } from "express";

import { authenticate } from "../../../middlewares/auth.middleware";
import { authorize } from "../../../middlewares/role.middleware";
import { USER_ROLES } from "../../../constants/roles";

import { adminShareController } from "./adminShare.controller";

import { adminShareAnalyticsController } from "../admin-share-analytics/adminShareAnalytics.controller";
import { adminSharePurchaserController } from "../admin-share-purchaser/adminSharePurchaser.controller";
import { adminSharePurchaserDetailsController } from "../admin-share-purchaser-details/adminSharePurchaserDetails.controller";
import { adminShareReturnController } from "../admin-share-return/adminShareReturn.controller";

const router = Router();

// AUTHENTICATION
router.use(
    authenticate,
);

// ADMIN AUTHORIZATION
router.use(
    authorize(
        USER_ROLES.ADMIN,
    ),
);

// ADMIN SHARE LIST
// GET /admin/shares
router.get(
    "/",
    adminShareController.getShares.bind(
        adminShareController,
    ),
);

// CREATE SHARE
// POST /admin/shares
router.post(
    "/",
    adminShareController.create.bind(
        adminShareController,
    ),
);

// START SHARE
// POST /admin/shares/:id/start
router.post(
    "/:id/start",
    adminShareController.start.bind(
        adminShareController,
    ),
);

// CLOSE SHARE
// POST /admin/shares/:id/close
router.post(
    "/:id/close",
    adminShareController.close.bind(
        adminShareController,
    ),
);

// SHARE ANALYTICS
// GET /admin/shares/:id/analytics
router.get(
    "/:id/analytics",
    adminShareAnalyticsController.getAnalytics.bind(
        adminShareAnalyticsController,
    ),
);

// PURCHASER LIST
// GET /admin/shares/:id/purchasers
// Example: GET /admin/shares/abc123/purchasers?page=1&limit=20
router.get(
    "/:id/purchasers",
    adminSharePurchaserController.getPurchasers.bind(
        adminSharePurchaserController,
    ),
);

// PURCHASER DETAILS.
// GET /admin/shares/:id/purchasers/:purchaseId
router.get(
    "/:id/purchasers/:purchaseId",
    adminSharePurchaserDetailsController.getPurchaserDetails.bind(
        adminSharePurchaserDetailsController,
    ),
);

// RETURN EXPIRED SHARE PURCHASE
// POST /admin/shares/:id/purchasers/:purchaseId/return
router.post(
    "/:id/purchasers/:purchaseId/return",
    adminShareReturnController.processReturn.bind(
        adminShareReturnController,
    ),
);

// GET SHARE DETAILS
// GET /admin/shares/:id
router.get(
    "/:id",
    adminShareController.getById.bind(
        adminShareController,
    ),
);

// UPDATE SHARE
// PATCH /admin/shares/:id
router.patch(
    "/:id",
    adminShareController.update.bind(
        adminShareController,
    ),
);

// DELETE SHARE
router.delete(
    "/:id",
    adminShareController.delete.bind(
        adminShareController,
    ),
);


export default router;