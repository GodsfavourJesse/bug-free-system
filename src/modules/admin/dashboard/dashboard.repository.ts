import {
    and,
    count,
    desc,
    eq,
    gte,
    sql,
} from "drizzle-orm";
import { DbExecutor } from "../../../database/types/types";
import { db } from "../../../database";
import { membershipPlans, notifications, transactions, upgradeRequests, users, withdrawals } from "../../../database/schema";
import { UpgradeRequestStatus } from "../../../database/enums/upgrade.enum";
import { WithdrawalStatus } from "../../../database/enums/withdrawal.enum";
import { TransactionStatus, TransactionType } from "../../../database/enums/transaction.enum";

export class DashboardRepository {

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
            revenue,
        ] = await Promise.all([

            executor
                .select({
                    value: count(),
                })
                .from(users),

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

            executor
                .select({
                    value: sql<string>`
                        COALESCE(SUM(${transactions.amount}),0)
                    `,
                })
                .from(transactions)
                .where(
                    eq(
                        transactions.status,
                        TransactionStatus.COMPLETED,
                    ),
                ),
        ]);

        return {
            totalUsers: Number(totalUsers[0].value),
            activeUsers: Number(activeUsers[0].value),
            verifiedUsers: Number(verifiedUsers[0].value),
            pendingUpgradeRequests: Number(pendingUpgrades[0].value),
            pendingWithdrawals: Number(pendingWithdrawals[0].value),
            totalTransactions: Number(completedTransactions[0].value),
            totalRevenue: Number(revenue[0].value),
        };
    }

    async findRecentActivities(
        limit = 15,
        executor: DbExecutor = db,
    ) {

        return executor
            .select({

                id:
                    notifications.id,

                title:
                    notifications.title,

                message:
                    notifications.message,

                type:
                    notifications.type,

                createdAt:
                    notifications.createdAt,

                user: {

                    id:
                        users.id,

                    phone:
                        users.phone,

                    email:
                        users.email,

                    referralCode:
                        users.referralCode,
                },

            })
            .from(
                notifications,
            )
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
            .limit(
                limit,
            );
    }

    async findPendingUpgradeRequests(
        limit = 10,
        executor: DbExecutor = db,
    ) {

        return executor
            .select({
                id: upgradeRequests.id,
                amount: upgradeRequests.amount,
                status: upgradeRequests.status,
                paymentMethod: upgradeRequests.paymentMethod,
                paymentProof: upgradeRequests.paymentProof,
                createdAt: upgradeRequests.createdAt,
                reference: upgradeRequests.reference,

                user: {
                    id: users.id,
                    phone: users.phone,
                    email: users.email,
                    referralCode: users.referralCode,
                },

                membership: {
                    id: membershipPlans.id,
                    name: membershipPlans.name,
                    slug: membershipPlans.slug,
                },
            })
            .from(
                upgradeRequests,
            )
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
            .limit(
                limit,
            );
    }

    async findPendingWithdrawalRequests(
        limit = 10,
        executor: DbExecutor = db,
    ) {
        return executor
            .select({
                id: withdrawals.id,
                amount: withdrawals.amount,
                status: withdrawals.status,          // add this
                accountName: withdrawals.accountName,
                accountNumber: withdrawals.accountNumber,
                bankName: withdrawals.bankName,
                createdAt: withdrawals.createdAt,
                user: {
                    id: users.id,
                    phone: users.phone,
                    email: users.email,
                    referralCode: users.referralCode,
                },
            })
            .from(
                withdrawals,
            )
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
            .limit(
                limit,
            );
    }

    async findMembershipDistribution(
        executor: DbExecutor = db,
    ) {

        return executor
            .select({

                id:
                    membershipPlans.id,

                name:
                    membershipPlans.name,

                slug:
                    membershipPlans.slug,

                totalUsers:
                    count(
                        users.id,
                    ),

            })
            .from(
                membershipPlans,
            )
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

    async findDailyRevenue(
        days = 30,
        executor: DbExecutor = db,
    ) {
        const startDate = new Date();

        startDate.setDate(
            startDate.getDate() - days,
        );

        return executor
            .select({
                date: sql<string>`
                    DATE(${transactions.createdAt})
                `,

                revenue: sql<string>`
                    COALESCE(
                        SUM(${transactions.amount}),
                        0
                    )
                `,
            })
            .from(transactions)
            .where(
                and (
                    eq(
                        transactions.status,
                        TransactionStatus.COMPLETED,
                    ),
                    eq(
                        transactions.type,
                        TransactionType.PURCHASE,
                    ),
                    gte(
                        transactions.createdAt,
                        startDate,
                    ),
                ),
            )
            .groupBy(
                sql`
                    DATE(${transactions.createdAt})
                `,
            )
            .orderBy(
                desc(
                    sql`
                        DATE(${transactions.createdAt})
                    `,
                ),
            );
    }

    async findUserGrowth(
        days = 30,
        executor: DbExecutor = db,
    ) {
        const startDate = new Date();

        startDate.setDate(
            startDate.getDate() - days,
        );

        return executor
            .select({
                date: sql<string>`DATE(${users.createdAt})`,
                users: sql<number>`COUNT(*)`,   // renamed from totalUsers
            })
            .from( users )
            .where(
                gte(
                    users.createdAt,
                    startDate,
                ),
            )
            .groupBy(
                sql`
                    DATE(${users.createdAt})
                `,
            )
            .orderBy(
                desc(
                    sql`
                        DATE(${users.createdAt})
                    `,
                ),
            );
    }
}

export const dashboardRepository = new DashboardRepository();