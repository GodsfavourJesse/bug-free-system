import {
    desc,
    eq,
    inArray,
} from "drizzle-orm";

import { db } from "../../../database";
import { DbExecutor } from "../../../database/types/types";

import {
    deposits,
    users,
    membershipPlans,
} from "../../../database/schema";

import { DepositStatus } from "../../../database/enums/deposit.enum";

export class AdminDepositRepository {

    /**
     * ----------------------------------------
     * Base query
     * ----------------------------------------
     *
     * Returns raw database entities with joins.
     * No mapping.
     * No formatting.
     */
    private baseQuery(
        executor: DbExecutor = db,
    ) {
        return executor
            .select({
                deposit: deposits,
                user: users,
                membership: membershipPlans,
            })
            .from(deposits)
            .leftJoin(
                users,
                eq(
                    deposits.userId,
                    users.id,
                ),
            )
            .leftJoin(
                membershipPlans,
                eq(
                    users.membershipPlanId,
                    membershipPlans.id,
                ),
            );
    }

    /**
     * ----------------------------------------
     * Find all deposits
     * ----------------------------------------
     */
    async findAll(
        executor: DbExecutor = db,
    ) {
        return this.baseQuery(executor)
            .orderBy(
                desc(
                    deposits.createdAt,
                ),
            );
    }

    /**
     * ----------------------------------------
     * Find pending deposits
     * ----------------------------------------
     */
    async findPending(
        executor: DbExecutor = db,
    ) {
        return this.baseQuery(executor)
            .where(
                inArray(
                    deposits.status,
                    [
                        DepositStatus.PENDING,
                        DepositStatus.UNDER_REVIEW,
                    ],
                ),
            )
            .orderBy(
                desc(
                    deposits.createdAt,
                ),
            );
    }

    /**
     * ----------------------------------------
     * Find deposit by ID
     * ----------------------------------------
     */
    async findById(
        executor: DbExecutor = db,
        depositId: string,
    ) {
        const [result] =
            await this.baseQuery(executor)
                .where(
                    eq(
                        deposits.id,
                        depositId,
                    ),
                )
                .limit(1);

        return result ?? null;
    }

    /**
     * ----------------------------------------
     * Approve deposit
     * ----------------------------------------
     */
    async approve(
        executor: DbExecutor = db,
        depositId: string,
        adminId: string,
        adminRemark?: string,
    ) {
        const [deposit] =
            await executor
                .update(deposits)
                .set({
                    status:
                        DepositStatus.APPROVED,

                    reviewedBy:
                        adminId,

                    reviewedAt:
                        new Date(),

                    adminRemark,
                })
                .where(
                    eq(
                        deposits.id,
                        depositId,
                    ),
                )
                .returning();

        return deposit;
    }

    /**
     * ----------------------------------------
     * Reject deposit
     * ----------------------------------------
     */
    async decline(
        executor: DbExecutor = db,
        depositId: string,
        adminId: string,
        adminRemark: string,
    ) {
        const [deposit] =
            await executor
                .update(deposits)
                .set({
                    status:
                        DepositStatus.DECLINED,

                    reviewedBy:
                        adminId,

                    reviewedAt:
                        new Date(),

                    adminRemark,
                })
                .where(
                    eq(
                        deposits.id,
                        depositId,
                    ),
                )
                .returning();

        return deposit;
    }

}

export const adminDepositRepository =
    new AdminDepositRepository();