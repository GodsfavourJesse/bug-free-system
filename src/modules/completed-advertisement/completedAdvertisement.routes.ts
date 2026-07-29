import { Router } from "express";


import { completedAdvertisementController } from "./completedAdvertisement.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

/**
 * Complete an advertisement.
 *
 * POST /completed-advertisements
 */
router.post(
    "/",
    authenticate,
    completedAdvertisementController.complete,
);

/**
 * Get the authenticated user's
 * completed advertisements.
 *
 * GET /completed-advertisements
 */
router.get(
    "/",
    authenticate,
    completedAdvertisementController.getUserCompleted,
);

/**
 * Determine whether the authenticated
 * user has completed an advertisement.
 *
 * GET /completed-advertisements/:advertisementId
 */
router.get(
    "/:advertisementId",
    authenticate,
    completedAdvertisementController.hasCompleted,
);

/**
 * Get the total number of completions
 * for an advertisement.
 *
 * GET /completed-advertisements/:advertisementId/count
 */
router.get(
    "/:advertisementId/count",
    authenticate,
    completedAdvertisementController.countCompleted,
);

export default router;