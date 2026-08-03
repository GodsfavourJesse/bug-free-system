import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { depositController } from "./deposit.controller";

const router = Router();

/**
 * User Deposit Routes
 */

// Submit deposit request.
router.post(
    "/",
    authenticate,
    depositController.requestDeposit.bind(
        depositController,
    ),
);

// My deposits.
router.get(
    "/",
    authenticate,
    depositController.findMyDeposits.bind(
        depositController,
    ),
);

// Pending deposit
router.get(
    "/pending",
    authenticate,
    depositController.getPendingDeposit.bind(
        depositController,
    ),
);

// Reference
router.get(
    "/reference/:reference",
    authenticate,
    depositController.findDepositByReference.bind(
        depositController,
    ),
);

// Single deposit.
router.get(
    "/:depositId",
    authenticate,
    depositController.findDeposit.bind(
        depositController,
    ),
);

// Cancel deposit.
router.patch(
    "/:depositId/cancel",
    authenticate,
    depositController.cancelDeposit.bind(
        depositController,
    ),
);


export default router;