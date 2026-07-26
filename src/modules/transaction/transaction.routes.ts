import { Router } from "express";

import { transactionController } from "./transaction.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// All transaction routes require authentication.
router.use(authenticate);

// GET /transactions
// Returns the authenticated user's transactions.
router.get(
    "/",
    transactionController.getUserTransactions.bind(
        transactionController,
    ),
);

// GET /transactions/reference/:reference
// Returns a transaction by its reference.
router.get(
    "/reference/:reference",
    transactionController.getTransactionByReference.bind(
        transactionController,
    ),
);

// GET /transactions/:id
// Returns a transaction by its ID.
router.get(
    "/:id",
    transactionController.getTransactionById.bind(
        transactionController,
    ),
);

export default router;