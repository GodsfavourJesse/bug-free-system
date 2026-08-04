import { Router } from "express";

import { adminWalletController } from "./adminWallet.controller";
import { authenticate } from "../../../middlewares/auth.middleware";
import { authorize } from "../../../middlewares/role.middleware";
import { USER_ROLES } from "../../../constants/roles";
import { adminWalletTransactionController } from "./admin-wallet-transaction/adminWalletTransaction.controller";

const router = Router();

router.get(
    "/",
    authenticate,
    authorize(USER_ROLES.ADMIN),
    adminWalletController.getWallet,
);

router.get(
    "/transactions",
    adminWalletTransactionController.getTransactions,
)


export default router;