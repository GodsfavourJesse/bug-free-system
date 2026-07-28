import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { adminDailyOrderConfigController } from "./dailyOrderConfig.controller";
import { USER_ROLES } from "../../constants/roles";

const router = Router();

/**
 * Every daily order configuration route
 * requires authentication and admin access.
 */
router.use(authenticate);

router.use(
    authorize(USER_ROLES.ADMIN),
);

/**
 * Return every configuration.
 *
 * GET /admin/daily-order-configs
 */
router.get(
    "/",
    adminDailyOrderConfigController.findAll,
);

/**
 * Return one configuration.
 *
 * GET /admin/daily-order-configs/:id
 */
router.get(
    "/:id",
    adminDailyOrderConfigController.findById,
);

/**
 * Create a configuration.
 *
 * POST /admin/daily-order-configs
 */
router.post(
    "/",
    adminDailyOrderConfigController.create,
);

/**
 * Update a configuration.
 *
 * PATCH /admin/daily-order-configs/:id
 */
router.patch(
    "/:id",
    adminDailyOrderConfigController.update,
);

/**
 * Delete a configuration.
 *
 * DELETE /admin/daily-order-configs/:id
 */
router.delete(
    "/:id",
    adminDailyOrderConfigController.delete,
);

/**
 * Activate a configuration.
 *
 * PATCH /admin/daily-order-configs/:id/activate
 */
router.patch(
    "/:id/activate",
    adminDailyOrderConfigController.activate,
);

/**
 * Deactivate a configuration.
 *
 * PATCH /admin/daily-order-configs/:id/deactivate
 */
router.patch(
    "/:id/deactivate",
    adminDailyOrderConfigController.deactivate,
);

export default router;