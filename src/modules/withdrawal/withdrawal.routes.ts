import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { withdrawalController } from "./withdrawal.controller";

const router = Router();

// All withdrawal routes require authentication.
router.use(authenticate);

// Create a withdrawal request.
router.post(
    "/",
    withdrawalController.createWithdrawal,
);

// Get the logged-in user's withdrawals.
router.get(
    "/",
    withdrawalController.getUserWithdrawals,
);

// Get one of the logged-in user's withdrawals.
router.get(
    "/:id",
    withdrawalController.getWithdrawal,
);

export default router;