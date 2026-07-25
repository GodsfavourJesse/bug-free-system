import { Router } from "express";

import { withdrawalController } from "./withdrawal.controller";

import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";

const router = Router();

// All withdrawal routes require authentication.
router.use(authenticate);

// User routes.
router.post(
    "/",
    withdrawalController.createWithdrawal,
);

router.get(
    "/",
    withdrawalController.getUserWithdrawals,
);

router.get(
    "/:id",
    withdrawalController.getWithdrawal,
);

// Admin routes.
router.patch(
    "/admin/:id/approve",
    authorize("admin"),
    withdrawalController.approveWithdrawal,
);

router.patch(
    "/admin/:id/reject",
    authorize("admin"),
    withdrawalController.rejectWithdrawal,
);

router.patch(
    "/admin/:id/paid",
    authorize("admin"),
    withdrawalController.markPaid,
);

export default router;