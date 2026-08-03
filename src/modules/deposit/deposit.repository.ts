import { and, desc, eq, inArray } from "drizzle-orm";

import { db } from "../../database";
import { DbExecutor } from "../../database/types/types";

import { deposits } from "../../database/schema";
import { DepositStatus } from "../../database/enums/deposit.enum";

export class DepositRepository {

    /**
     * Create a new deposit request.
     */
    async create(
        executor: DbExecutor = db,
        data: typeof deposits.$inferInsert,
    ) {
        const [deposit] = await executor
            .insert(deposits)
            .values(data)
            .returning();

        return deposit;
    }

    /**
     * Find deposit by ID.
     */
    async findById(
        executor: DbExecutor = db,
        depositId: string,
    ) {
        const [deposit] = await executor
            .select()
            .from(deposits)
            .where(
                eq(
                    deposits.id,
                    depositId,
                ),
            )
            .limit(1);

        return deposit;
    }

    /**
     * Find deposit by reference.
     */
    async findByReference(
        executor: DbExecutor = db,
        reference: string,
    ) {
        const [deposit] = await executor
            .select()
            .from(deposits)
            .where(
                eq(
                    deposits.reference,
                    reference,
                ),
            )
            .limit(1);

        return deposit;
    }

    /**
     * Return every deposit
     * belonging to one user.
     */
    async findByUser(
        executor: DbExecutor = db,
        userId: string,
    ) {
        return executor
            .select()
            .from(deposits)
            .where(
                eq(
                    deposits.userId,
                    userId,
                ),
            )
            .orderBy(
                desc(
                    deposits.createdAt,
                ),
            );
    }

    async findPendingByUser(
        executor: DbExecutor = db,
        userId: string,
    ) {
        const [deposit] = await executor
            .select()
            .from(deposits)
            .where(
                and(
                    eq(deposits.userId, userId),
                    inArray(
                        deposits.status,
                        [
                            DepositStatus.PENDING,
                            DepositStatus.UNDER_REVIEW,
                        ],
                    ),
                ),
            )
            .limit(1);

        return deposit;
    }

    /**
     * Cancel a pending deposit.
     */
    async cancel(
        executor: DbExecutor = db,
        depositId: string,
    ) {
        const [deposit] = await executor
            .update(deposits)
            .set({
                status:
                    DepositStatus.CANCELLED,

                updatedAt:
                    new Date(),
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

export const depositRepository =
    new DepositRepository();