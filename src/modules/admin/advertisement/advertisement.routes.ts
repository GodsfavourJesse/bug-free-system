import { Router } from "express";

import { advertisementController } from "./advertisement.controller";

import { authenticate } from "../../../middlewares/auth.middleware";
import { authorize } from "../../../middlewares/role.middleware";
import { USER_ROLES } from "../../../constants/roles";

const router = Router();

// Protect every advertisement route.
router.use(
    authenticate,
    authorize(USER_ROLES.ADMIN),
);

/**
 * GET /admin/advertisements
 * Get all advertisements.
 */
router.get("/", advertisementController.getAdvertisements);

/**
 * GET /admin/advertisements/:id
 * Get a single advertisement.
 */
router.get(
    "/:id",
    advertisementController.getAdvertisement.bind(
        advertisementController,
    ),
);

/**
 * POST /admin/advertisements
 * Create a new advertisement.
 */
router.post("/", advertisementController.createAdvertisement);

/**
 * PUT /admin/advertisements/:id
 * Update an advertisement.
 */
router.put("/:id", advertisementController.updateAdvertisement);


/**
 * PATCH /admin/advertisements/:id/activate
 * Activate an advertisement.
 */
router.patch(
    "/:id/activate",
    advertisementController.activateAdvertisement.bind(
        advertisementController,
    ),
);

/**
 * PATCH /admin/advertisements/:id/deactivate
 * Deactivate an advertisement.
 */
router.patch(
    "/:id/deactivate",
    advertisementController.deactivateAdvertisement.bind(
        advertisementController,
    ),
);

/**
 * PATCH /admin/advertisements/:id/publish
 * Publish an advertisement.
 */
router.patch(
    "/:id/publish",
    advertisementController.publishAdvertisement.bind(
        advertisementController,
    ),
);

/**
 * PATCH /admin/advertisements/:id/archive
 * Archive an advertisement.
 */
router.patch(
    "/:id/archive",
    advertisementController.archiveAdvertisement.bind(
        advertisementController,
    ),
);

/**
 * DELETE /admin/advertisements/:id
 * Archive (soft delete) an advertisement.
 */
router.delete(
    "/:id",
    advertisementController.deleteAdvertisement.bind(
        advertisementController,
    ),
);


export default router;