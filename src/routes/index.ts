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
import completedAdvertisementRoutes from "../modules/completed-advertisement/completedAdvertisement.routes";
import depositRoutes from "../modules/deposit/deposit.routes";
import shareRoutes from "../modules/share/share.routes";
import supportRoutes from "../modules/support/support.routes";
import corporateRoutes from "../modules/corporate/corporate.routes";


import adminDashboardRoutes from "../modules/admin/dashboard/dashboard.routes";
import adminUpgradeRoutes from "../modules/admin/upgrade/adminUpgrade.routes";
import adminUserRoutes from "../modules/admin/users/admin-user.routes";
import adminUserProfileRoutes from "../modules/admin/user-profile/admin-user-profile.routes";
import adminWithdrawalRoutes from "../modules/admin/withdrawal/adminWithdrawal.routes";
import adminDailyOrderConfigRoutes from "../modules/admin/daily-order-config/dailyOrderConfig.routes"
import adminAdvertisementRoutes from "../modules/admin/advertisement/advertisement.routes";
import adminDepositRoutes from "../modules/admin/admin-deposit/adminDeposit.routes";
import adminWalletRoutes from "../modules/admin/admin-wallet/adminWallet.routes";
import adminShareRoutes from "../modules/admin/admin-share/adminShare.routes";
import adminSupportRoutes from "../modules/admin/admin-support/adminSupport.routes";
import adminCorporateRoutes from "../modules/admin/admin-corporate/adminCorporate.routes";

const router = Router();

// USER

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
    "/completed-advertisements",
    completedAdvertisementRoutes,
);

router.use(
    "/withdrawals",
    withdrawalRoutes,
);

router.use(
    "/deposits",
    depositRoutes,
);

router.use(
    "/shares",
    shareRoutes,
);

router.use(
    "/support",
    supportRoutes,
);

router.use(
    "/corporate",
    corporateRoutes,
);


// ADMIN

router.use(
    "/admin/dashboard",
    adminDashboardRoutes,
);

router.use(
    "/admin/wallet",
    adminWalletRoutes,
);

router.use(
    "/admin/upgrade-requests",
    adminUpgradeRoutes,
);

router.use(
    "/admin/users",
    adminUserRoutes,
);

router.use(
    "/admin/user-profile",
    adminUserProfileRoutes,
);

router.use(
    "/admin/withdrawals",
    adminWithdrawalRoutes,
);

router.use(
    "/admin/daily-order-configs",
    adminDailyOrderConfigRoutes,
);

router.use(
    "/admin/advertisements",
    adminAdvertisementRoutes,
);

router.use(
    "/admin/deposits",
    adminDepositRoutes,
);

router.use(
    "/admin/shares",
    adminShareRoutes,
);

router.use(
    "/admin/support",
    adminSupportRoutes,
);

router.use(
    "/admin/corporate",
    adminCorporateRoutes,
);

export default router;