import {
    desc,
    eq,
} from "drizzle-orm";

import { db } from "../../../database";
import { DbExecutor } from "../../../database/types/types";

import {
    users,
    withdrawals,
} from "../../../database/schema";

export class AdminWithdrawalRepository {

    /**
     * Return every withdrawal request with
     * the associated user information.
     */
    async findAll(
        executor: DbExecutor = db,
    ) {
        return executor
            .select({
                id: withdrawals.id,
                userId: withdrawals.userId,
                walletId: withdrawals.walletId,

                amount: withdrawals.amount,

                accountName: withdrawals.accountName,
                accountNumber: withdrawals.accountNumber,
                bankName: withdrawals.bankName,

                status: withdrawals.status,

                adminRemark: withdrawals.adminRemark,

                reviewedBy: withdrawals.reviewedBy,
                reviewedAt: withdrawals.reviewedAt,

                createdAt: withdrawals.createdAt,
                updatedAt: withdrawals.updatedAt,

                user: {
                    id: users.id,
                    email: users.email,
                    phone: users.phone,
                    referralCode: users.referralCode,
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

            .orderBy(
                desc(
                    withdrawals.createdAt,
                ),
            );
    }

    /**
     * Return one withdrawal request with
     * the associated user information.
     */
    async findById(
        executor: DbExecutor = db,
        id: string,
    ) {
        const [withdrawal] =
            await executor
                .select({
                    id: withdrawals.id,
                    userId: withdrawals.userId,
                    walletId: withdrawals.walletId,

                    amount: withdrawals.amount,

                    accountName: withdrawals.accountName,
                    accountNumber: withdrawals.accountNumber,
                    bankName: withdrawals.bankName,

                    status: withdrawals.status,

                    adminRemark: withdrawals.adminRemark,

                    reviewedBy: withdrawals.reviewedBy,
                    reviewedAt: withdrawals.reviewedAt,

                    createdAt: withdrawals.createdAt,
                    updatedAt: withdrawals.updatedAt,

                    user: {
                        id: users.id,
                        email: users.email,
                        phone: users.phone,
                        referralCode: users.referralCode,
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
                        withdrawals.id,
                        id,
                    ),
                )
                .limit(1);

        return withdrawal ?? null;
    }
}

export const adminWithdrawalRepository =
    new AdminWithdrawalRepository();