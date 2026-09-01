import { Router } from "express";


import { authenticate } from "../../../middlewares/auth.middleware";
import { authorize } from "../../../middlewares/role.middleware";
import { USER_ROLES } from "../../../constants/roles";
import { adminCorporateController } from "./adminCorporateController";

const router = Router();

// AUTHENTICATION

router.use(authenticate);

// ADMIN AUTHORIZATION

router.use(
    authorize(USER_ROLES.ADMIN),
);

// ADMIN CORPORATE ANNOUNCEMENTS

/**
 * Get all corporate announcements.
 *
 * GET /admin/corporate
 */
router.get(
    "/",
    adminCorporateController
        .getAll
        .bind(adminCorporateController),
);

/**
 * Get one corporate announcement.
 *
 * GET /admin/corporate/:id
 */
router.get(
    "/:id",
    adminCorporateController
        .getOne
        .bind(adminCorporateController),
);

/**
 * Create corporate announcement.
 *
 * POST /admin/corporate
 */
router.post(
    "/",
    adminCorporateController
        .create
        .bind(adminCorporateController),
);

/**
 * Update corporate announcement.
 *
 * PATCH /admin/corporate/:id
 */
router.patch(
    "/:id",
    adminCorporateController
        .update
        .bind(adminCorporateController),
);

/**
 * Publish corporate announcement.
 *
 * PATCH /admin/corporate/:id/publish
 */
router.patch(
    "/:id/publish",
    adminCorporateController
        .publish
        .bind(adminCorporateController),
);

/**
 * Unpublish corporate announcement.
 *
 * PATCH /admin/corporate/:id/unpublish
 */
router.patch(
    "/:id/unpublish",
    adminCorporateController
        .unpublish
        .bind(adminCorporateController),
);

/**
 * Delete corporate announcement.
 *
 * DELETE /admin/corporate/:id
 */
router.delete(
    "/:id",
    adminCorporateController
        .delete
        .bind(adminCorporateController),
);

export default router;