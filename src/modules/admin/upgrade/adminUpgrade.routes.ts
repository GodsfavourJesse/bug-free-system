import { Router } from "express";

import { authenticate } from "../../../middlewares/auth.middleware";
import { authorize } from "../../../middlewares/role.middleware";

import { adminUpgradeController } from "./adminUpgrade.controller";
import { USER_ROLES } from "../../../constants/roles";

const router = Router();

// All routes require authentication.
router.use(authenticate);

// Admin only.
router.use(
    authorize(USER_ROLES.ADMIN),
);

// Mark an upgrade request as under review.
router.patch(
    "/:id/under-review",
    adminUpgradeController.markUnderReview.bind(
        adminUpgradeController,
    ),
);

// Approve an upgrade request.
router.patch(
    "/:id/approve",
    adminUpgradeController.approve.bind(
        adminUpgradeController,
    ),
);

// Reject an upgrade request.
router.patch(
    "/:id/reject",
    adminUpgradeController.reject.bind(
        adminUpgradeController,
    ),
);

export default router;