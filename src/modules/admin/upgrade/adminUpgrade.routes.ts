import { Router } from "express";

import { authenticate } from "../../../middlewares/auth.middleware";
import { authorize } from "../../../middlewares/role.middleware";

import { USER_ROLES } from "../../../constants/roles";
import { adminUpgradeController } from "./adminUpgrade.controller";

const router = Router();

// --------------------------------------------------
// Authentication
// --------------------------------------------------

router.use(authenticate);

// --------------------------------------------------
// Admin only
// --------------------------------------------------

router.use(
    authorize(USER_ROLES.ADMIN),
);

// --------------------------------------------------
// GET /admin/upgrade-requests
// --------------------------------------------------

router.get(
    "/",
    adminUpgradeController.findAll.bind(
        adminUpgradeController,
    ),
);

// --------------------------------------------------
// GET /admin/upgrade-requests/:id
// --------------------------------------------------

router.get(
    "/:id",
    adminUpgradeController.findById.bind(
        adminUpgradeController,
    ),
);

// --------------------------------------------------
// PATCH /admin/upgrade-requests/:id/under-review
// --------------------------------------------------

router.patch(
    "/:id/under-review",
    adminUpgradeController.markUnderReview.bind(
        adminUpgradeController,
    ),
);

// --------------------------------------------------
// PATCH /admin/upgrade-requests/:id/approve
// --------------------------------------------------

router.patch(
    "/:id/approve",
    adminUpgradeController.approve.bind(
        adminUpgradeController,
    ),
);

// --------------------------------------------------
// PATCH /admin/upgrade-requests/:id/reject
// --------------------------------------------------

router.patch(
    "/:id/reject",
    adminUpgradeController.reject.bind(
        adminUpgradeController,
    ),
);

export default router;