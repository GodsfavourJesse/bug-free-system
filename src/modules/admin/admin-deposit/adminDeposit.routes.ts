import { Router } from "express";

import { adminDepositController } from "./adminDeposit.controller";
import { authenticate } from "../../../middlewares/auth.middleware";
import { authorize } from "../../../middlewares/role.middleware";
import { USER_ROLES } from "../../../constants/roles";


export const adminDepositRouter = Router();

/**
 * Every route requires an authenticated admin.
 */
adminDepositRouter.use(authenticate);

adminDepositRouter.use(
    authorize(USER_ROLES.ADMIN),
);

adminDepositRouter.get(
    "/",
    adminDepositController.findAllDeposits.bind(
        adminDepositController,
    ),
);

adminDepositRouter.get(
    "/pending",
    adminDepositController.findPendingDeposits.bind(
        adminDepositController,
    ),
);

adminDepositRouter.get(
    "/:depositId",
    adminDepositController.findDepositById.bind(
        adminDepositController,
    ),
);

adminDepositRouter.patch(
    "/:depositId/approve",
    adminDepositController.approveDeposit.bind(
        adminDepositController,
    ),
);

adminDepositRouter.patch(
    "/:depositId/reject",
    adminDepositController.rejectDeposit.bind(
        adminDepositController,
    ),
);
export default adminDepositRouter;