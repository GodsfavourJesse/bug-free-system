import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import walletRoutes from "../modules/wallet/wallet.routes";
import transactionRoutes from "../modules/transaction/transaction.routes";
import membershipPlanRoutes from "../modules/membership-plan/membershipPlan.routes";
import upgradeRoutes from "../modules/upgrade/upgrade.routes";
import fileRoutes from "../modules/file/file.routes";
import notificationRoutes from "../modules/notification/notification.routes";
import referralRoutes from "../modules/referral/referral.routes";
import orderRoutes from "../modules/order/order.routes";
import withdrawalRoutes from "../modules/withdrawal/withdrawal.routes";

import adminUpgradeRoutes from "../modules/admin/upgrade/adminUpgrade.routes";
import adminUserRoutes from "../modules/admin/users/admin-user.routes";
import adminUserProfileRoutes from "../modules/admin/user-profile/admin-user-profile.routes";



const router = Router();

router.use(
    "/auth",
    authRoutes
);

router.use(
    "/wallet",
    walletRoutes
);

router.use(
    "/transactions",
    transactionRoutes
);

router.use(
    "/membership-plans",
    membershipPlanRoutes
);

router.use(
    "/upgrade-requests",
    upgradeRoutes
);


router.use(
    "/files",
    fileRoutes,
);

router.use(
    "/notifications",
    notificationRoutes,
);

router.use(
    "/referrals",
    referralRoutes,
);

router.use(
    "/orders",
    orderRoutes,
);

router.use(
    "/withdrawals",
    withdrawalRoutes,
);


// ADMIN

router.use(
    "/admin/upgrade-requests",
    adminUpgradeRoutes,
);

router.use(
    "/admin/users",
    adminUserRoutes,
);

router.use(
    "/users",
    adminUserProfileRoutes,
);

export default router;