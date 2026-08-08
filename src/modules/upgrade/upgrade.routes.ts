import { Router } from "express";
import { upgradeController } from "./upgrade.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// All upgrade request routes require authentication.

router.use(authenticate);

// User Routes

// Create a new upgrade request.
router.post(
    "/",
    upgradeController.requestUpgrade.bind(
        upgradeController,
    ),
);

// Return authenticated user's upgrade requests.
router.get(
    "/",
    upgradeController.findByUser.bind(
        upgradeController,
    ),
);

// Return all pending upgrade requests.
//
// NOTE:
// This endpoint will move to the Admin module
// in Phase 4.7B. It is temporarily exposed here
// until the Admin Upgrade Service is completed.
router.get(
    "/pending",
    upgradeController.findPending.bind(
        upgradeController,
    ),
);

router.get(
    "/validate/:membershipPlanId",
    upgradeController.validateUpgrade.bind(
        upgradeController,
    ),
);

// Return a single upgrade request.
router.get(
    "/:id",
    upgradeController.findById.bind(
        upgradeController,
    ),
);

// Cancel an existing pending request.
router.delete(
    "/:id",
    upgradeController.cancelRequest.bind(
        upgradeController,
    ),
);

export default router;