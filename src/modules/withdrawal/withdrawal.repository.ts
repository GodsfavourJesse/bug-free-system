import {
    and,
    desc,
    eq,
} from "drizzle-orm";

import { db } from "@/database";
import { DbExecutor } from "@/database/types/types";

import {
    withdrawals,
} from "@/database/schema";

import {
    WithdrawalStatus,
} from "@/database/enums/withdrawal.enum";

export class WithdrawalRepository {

    // Create a withdrawal request.
    async create(
        executor: DbExecutor = db,
        data: {
            userId: string;
            walletId: string;
            amount: string;
            accountName: string;
            accountNumber: string;
            bankName: string;
        },
    ) {
        const [withdrawal] =
            await executor
                .insert(withdrawals)
                .values(data)
                .returning();

        return withdrawal;
    }

    // Find one withdrawal by ID.
    async findById(
        executor: DbExecutor = db,
        withdrawalId: string,
    ) {
        const [withdrawal] =
            await executor
                .select()
                .from(withdrawals)
                .where(
                    eq(
                        withdrawals.id,
                        withdrawalId,
                    ),
                )
                .limit(1);

        return withdrawal ?? null;
    }

    // Find every withdrawal
    // belonging to one user.
    async findByUser(
        executor: DbExecutor = db,
        userId: string,
    ) {
        return executor
            .select()
            .from(withdrawals)
            .where(
                eq(
                    withdrawals.userId,
                    userId,
                ),
            )
            .orderBy(
                desc(
                    withdrawals.createdAt,
                ),
            );
    }

    // Find every pending withdrawal.
    async findPending(
        executor: DbExecutor = db,
    ) {
        return executor
            .select()
            .from(withdrawals)
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
            );
    }

    // Find every withdrawal.
    async findAll(
        executor: DbExecutor = db,
    ) {
        return executor
            .select()
            .from(withdrawals)
            .orderBy(
                desc(
                    withdrawals.createdAt,
                ),
            );
    }

    // Approve a withdrawal.
    async approve(
        executor: DbExecutor,
        withdrawalId: string,
        reviewedBy: string,
        adminRemark?: string,
    ) {
        const [withdrawal] =
            await executor
                .update(withdrawals)
                .set({
                    status:
                        WithdrawalStatus.APPROVED,

                    reviewedBy,

                    reviewedAt:
                        new Date(),

                    adminRemark,
                })
                .where(
                    eq(
                        withdrawals.id,
                        withdrawalId,
                    ),
                )
                .returning();

        return withdrawal;
    }

    // Reject a withdrawal.
    async reject(
        executor: DbExecutor,
        withdrawalId: string,
        reviewedBy: string,
        adminRemark?: string,
    ) {
        const [withdrawal] =
            await executor
                .update(withdrawals)
                .set({
                    status:
                        WithdrawalStatus.REJECTED,

                    reviewedBy,

                    reviewedAt:
                        new Date(),

                    adminRemark,
                })
                .where(
                    eq(
                        withdrawals.id,
                        withdrawalId,
                    ),
                )
                .returning();

        return withdrawal;
    }

    // Mark a withdrawal as paid.
    async markPaid(
        executor: DbExecutor,
        withdrawalId: string,
    ) {
        const [withdrawal] =
            await executor
                .update(withdrawals)
                .set({
                    status:
                        WithdrawalStatus.PAID,
                })
                .where(
                    eq(
                        withdrawals.id,
                        withdrawalId,
                    ),
                )
                .returning();

        return withdrawal;
    }

    // Lock one withdrawal row.
    // Used during approval/rejection/payment.
    async lockById(
        executor: DbExecutor,
        withdrawalId: string,
    ) {
        const [withdrawal] =
            await executor
                .select()
                .from(withdrawals)
                .where(
                    eq(
                        withdrawals.id,
                        withdrawalId,
                    ),
                )
                .limit(1)
                .for("update");

        return withdrawal ?? null;
    }
}

export const withdrawalRepository =
    new WithdrawalRepository();