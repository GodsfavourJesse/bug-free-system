import { Router } from "express";

import { authenticate } from "../../../middlewares/auth.middleware";
import { authorize } from "../../../middlewares/role.middleware";

import { adminWithdrawalController } from "./adminWithdrawal.controller";

const router = Router();

/**
 * All admin withdrawal routes require
 * authentication and admin privileges.
 */
router.use(authenticate);

router.use(
    authorize("admin"),
);

/**
 * Get every withdrawal request.
 *
 * GET /admin/withdrawals
 */
router.get(
    "/",
    adminWithdrawalController.findAll,
);

/**
 * Get one withdrawal request.
 *
 * GET /admin/withdrawals/:id
 */
router.get(
    "/:id",
    adminWithdrawalController.findById,
);

/**
 * Approve a withdrawal request.
 *
 * PATCH /admin/withdrawals/:id/approve
 */
router.patch(
    "/:id/approve",
    adminWithdrawalController.approve,
);

/**
 * Reject a withdrawal request.
 *
 * PATCH /admin/withdrawals/:id/reject
 */
router.patch(
    "/:id/reject",
    adminWithdrawalController.reject,
);

/**
 * Mark an approved withdrawal
 * as paid.
 *
 * PATCH /admin/withdrawals/:id/paid
 */
router.patch(
    "/:id/paid",
    adminWithdrawalController.markPaid,
);

export default router;