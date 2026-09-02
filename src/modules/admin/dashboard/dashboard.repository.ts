import {
    and,
    count,
    desc,
    eq,
    gte,
    sql,
} from "drizzle-orm";

import {
    DbExecutor,
} from "../../../database/types/types";

import { db } from "../../../database";

import {
    adminWalletTransactions,
    membershipPlans,
    notifications,
    transactions,
    upgradeRequests,
    users,
    withdrawals,
} from "../../../database/schema";


import {
    UpgradeRequestStatus,
} from "../../../database/enums/upgrade.enum";

import {
    WithdrawalStatus,
} from "../../../database/enums/withdrawal.enum";

import {
    TransactionStatus,
} from "../../../database/enums/transaction.enum";
import { AdminWalletTransactionDirection } from "../../../database/enums/admin-wallet-transaction.enum";


export class DashboardRepository {

    // ============================================================
    // DASHBOARD STATISTICS
    // ============================================================

    async findStatistics(
        executor: DbExecutor = db,
    ) {

        const [
            totalUsers,
            activeUsers,
            verifiedUsers,
            pendingUpgrades,
            pendingWithdrawals,
            completedTransactions,
            adminCredits,
            adminDebits,
        ] = await Promise.all([

            // ====================================================
            // TOTAL USERS
            // ====================================================

            executor
                .select({
                    value: count(),
                })
                .from(users),

            // ====================================================
            // ACTIVE USERS
            // ====================================================

            executor
                .select({
                    value: count(),
                })
                .from(users)
                .where(
                    eq(
                        users.isActive,
                        true,
                    ),
                ),

            // ====================================================
            // VERIFIED USERS
            // ====================================================

            executor
                .select({
                    value: count(),
                })
                .from(users)
                .where(
                    eq(
                        users.isVerified,
                        true,
                    ),
                ),

            // ====================================================
            // PENDING UPGRADES
            // ====================================================

            executor
                .select({
                    value: count(),
                })
                .from(upgradeRequests)
                .where(
                    eq(
                        upgradeRequests.status,
                        UpgradeRequestStatus.PENDING,
                    ),
                ),

            // ====================================================
            // PENDING WITHDRAWALS
            // ====================================================

            executor
                .select({
                    value: count(),
                })
                .from(withdrawals)
                .where(
                    eq(
                        withdrawals.status,
                        WithdrawalStatus.PENDING,
                    ),
                ),

            // ====================================================
            // COMPLETED USER TRANSACTIONS
            //
            // This remains available as a general transaction count.
            // It is NOT used to calculate admin revenue.
            // ====================================================

            executor
                .select({
                    value: count(),
                })
                .from(transactions)
                .where(
                    eq(
                        transactions.status,
                        TransactionStatus.COMPLETED,
                    ),
                ),

            // ====================================================
            // ADMIN WALLET CREDITS
            //
            // Money entering the admin wallet.
            //
            // THIS IS REVENUE.
            // ====================================================

            executor
                .select({
                    value: sql<string>`
                        COALESCE(
                            SUM(
                                ${adminWalletTransactions.amount}
                            ),
                            0
                        )
                    `,
                })
                .from(adminWalletTransactions)
                .where(
                    eq(
                        adminWalletTransactions.direction,
                        AdminWalletTransactionDirection.CREDIT,
                    ),
                ),

            // ====================================================
            // ADMIN WALLET DEBITS
            //
            // Money leaving the admin wallet
            // and going to users.
            // ====================================================

            executor
                .select({
                    value: sql<string>`
                        COALESCE(
                            SUM(
                                ${adminWalletTransactions.amount}
                            ),
                            0
                        )
                    `,
                })
                .from(adminWalletTransactions)
                .where(
                    eq(
                        adminWalletTransactions.direction,
                        AdminWalletTransactionDirection.DEBIT,
                    ),
                ),
        ]);

        return {
            totalUsers:
                Number(
                    totalUsers[0]?.value ?? 0,
                ),

            activeUsers:
                Number(
                    activeUsers[0]?.value ?? 0,
                ),

            verifiedUsers:
                Number(
                    verifiedUsers[0]?.value ?? 0,
                ),

            pendingUpgradeRequests:
                Number(
                    pendingUpgrades[0]?.value ?? 0,
                ),

            pendingWithdrawals:
                Number(
                    pendingWithdrawals[0]?.value ?? 0,
                ),

            totalTransactions:
                Number(
                    completedTransactions[0]?.value ?? 0,
                ),

            // ====================================================
            // ADMIN REVENUE
            // ====================================================

            totalRevenue:
                Number(
                    adminCredits[0]?.value ?? 0,
                ),

            // ====================================================
            // ADMIN DEBITS
            // ====================================================

            totalAdminDebits:
                Number(
                    adminDebits[0]?.value ?? 0,
                ),
        };
    }


    // ============================================================
    // RECENT ACTIVITIES
    // ============================================================

    async findRecentActivities(
        limit = 15,
        executor: DbExecutor = db,
    ) {

        return executor
            .select({
                id: notifications.id,
                title: notifications.title,
                message: notifications.message,
                type: notifications.type,
                createdAt: notifications.createdAt,

                user: {
                    id: users.id,
                    phone: users.phone,
                    email: users.email,
                    referralCode: users.referralCode,
                },
            })
            .from(notifications)
            .leftJoin(
                users,
                eq(
                    notifications.userId,
                    users.id,
                ),
            )
            .orderBy(
                desc(
                    notifications.createdAt,
                ),
            )
            .limit(limit);
    }


    // ============================================================
    // PENDING UPGRADE REQUESTS
    // ============================================================

    async findPendingUpgradeRequests(
        limit = 10,
        executor: DbExecutor = db,
    ) {

        return executor
            .select({
                id: upgradeRequests.id,
                amount: upgradeRequests.amount,
                status: upgradeRequests.status,
                paymentMethod:
                    upgradeRequests.paymentMethod,
                paymentProof:
                    upgradeRequests.paymentProof,
                createdAt:
                    upgradeRequests.createdAt,
                reference:
                    upgradeRequests.reference,

                user: {
                    id: users.id,
                    phone: users.phone,
                    email: users.email,
                    referralCode:
                        users.referralCode,
                },

                membership: {
                    id: membershipPlans.id,
                    name: membershipPlans.name,
                    slug: membershipPlans.slug,
                },
            })
            .from(upgradeRequests)
            .leftJoin(
                users,
                eq(
                    upgradeRequests.userId,
                    users.id,
                ),
            )
            .leftJoin(
                membershipPlans,
                eq(
                    upgradeRequests.requestedMembershipPlanId,
                    membershipPlans.id,
                ),
            )
            .where(
                eq(
                    upgradeRequests.status,
                    UpgradeRequestStatus.PENDING,
                ),
            )
            .orderBy(
                desc(
                    upgradeRequests.createdAt,
                ),
            )
            .limit(limit);
    }


    // ============================================================
    // PENDING WITHDRAWALS
    // ============================================================

    async findPendingWithdrawalRequests(
        limit = 10,
        executor: DbExecutor = db,
    ) {

        return executor
            .select({
                id: withdrawals.id,
                amount: withdrawals.amount,
                status: withdrawals.status,
                accountName:
                    withdrawals.accountName,
                accountNumber:
                    withdrawals.accountNumber,
                bankName:
                    withdrawals.bankName,
                createdAt:
                    withdrawals.createdAt,

                user: {
                    id: users.id,
                    phone: users.phone,
                    email: users.email,
                    referralCode:
                        users.referralCode,
                },
            })
            .from(withdrawals)
            .leftJoin(
                users,
                eq(
                    withdrawals.userId,
                    users.id,
                ),
            )
            .where(
                eq(
                    withdrawals.status,
                    WithdrawalStatus.PENDING,
                ),
            )
            .orderBy(
                desc(
                    withdrawals.createdAt,
                ),
            )
            .limit(limit);
    }


    // ============================================================
    // MEMBERSHIP DISTRIBUTION
    // ============================================================

    async findMembershipDistribution(
        executor: DbExecutor = db,
    ) {

        return executor
            .select({
                id: membershipPlans.id,
                name: membershipPlans.name,
                slug: membershipPlans.slug,
                totalUsers:
                    count(users.id),
            })
            .from(membershipPlans)
            .leftJoin(
                users,
                eq(
                    membershipPlans.id,
                    users.membershipPlanId,
                ),
            )
            .groupBy(
                membershipPlans.id,
                membershipPlans.name,
                membershipPlans.slug,
            );
    }


    // ============================================================
    // DAILY ADMIN REVENUE
    // ============================================================

    async findDailyRevenue(
        days = 30,
        executor: DbExecutor = db,
    ) {

        const startDate =
            new Date();

        startDate.setDate(
            startDate.getDate() - days,
        );

        return executor
            .select({
                date: sql<string>`
                    DATE(
                        ${adminWalletTransactions.createdAt}
                    )
                `,

                revenue: sql<string>`
                    COALESCE(
                        SUM(
                            ${adminWalletTransactions.amount}
                        ),
                        0
                    )
                `,
            })
            .from(adminWalletTransactions)
            .where(
                and(
                    eq(
                        adminWalletTransactions.direction,
                        AdminWalletTransactionDirection.CREDIT,
                    ),

                    gte(
                        adminWalletTransactions.createdAt,
                        startDate,
                    ),
                ),
            )
            .groupBy(
                sql`
                    DATE(
                        ${adminWalletTransactions.createdAt}
                    )
                `,
            )
            .orderBy(
                desc(
                    sql`
                        DATE(
                            ${adminWalletTransactions.createdAt}
                        )
                    `,
                ),
            );
    }


    // ============================================================
    // USER GROWTH
    // ============================================================

    async findUserGrowth(
        days = 30,
        executor: DbExecutor = db,
    ) {

        const startDate =
            new Date();

        startDate.setDate(
            startDate.getDate() - days,
        );

        return executor
            .select({
                date: sql<string>`
                    DATE(
                        ${users.createdAt}
                    )
                `,

                users: sql<number>`
                    COUNT(*)
                `,
            })
            .from(users)
            .where(
                gte(
                    users.createdAt,
                    startDate,
                ),
            )
            .groupBy(
                sql`
                    DATE(
                        ${users.createdAt}
                    )
                `,
            )
            .orderBy(
                desc(
                    sql`
                        DATE(
                            ${users.createdAt}
                        )
                    `,
                ),
            );
    }
}


export const dashboardRepository =
    new DashboardRepository();