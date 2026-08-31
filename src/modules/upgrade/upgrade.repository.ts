import {
    and,
    desc,
    eq,
    or,
} from "drizzle-orm";

import { DbExecutor } from "../../database/types/types";
import { db } from "../../database";

import { upgradeRequests } from "../../database/schema";

import {
    UpgradeRequestStatus,
} from "../../database/enums/upgrade.enum";

export class UpgradeRepository {

    /**
     * Create a new upgrade request.
     */
    async create(
        executor: DbExecutor = db,
        data: typeof upgradeRequests.$inferInsert,
    ) {
        const [request] =
            await executor
                .insert(upgradeRequests)
                .values(data)
                .returning();

        return request;
    }

    /**
     * Find request by ID.
     */
    async findById(
        executor: DbExecutor = db,
        id: string,
    ) {
        const [request] =
            await executor
                .select()
                .from(upgradeRequests)
                .where(
                    eq(
                        upgradeRequests.id,
                        id,
                    ),
                )
                .limit(1);

        return request ?? null;
    }

    /**
     * Find request by reference.
     */
    async findByReference(
        executor: DbExecutor = db,
        reference: string,
    ) {
        const [request] =
            await executor
                .select()
                .from(upgradeRequests)
                .where(
                    eq(
                        upgradeRequests.reference,
                        reference,
                    ),
                )
                .limit(1);

        return request ?? null;
    }

    /**
     * Return all pending and under-review
     * requests.
     */
    async findPending(
        executor: DbExecutor = db,
    ) {
        return executor
            .select()
            .from(upgradeRequests)
            .where(
                or(
                    eq(
                        upgradeRequests.status,
                        UpgradeRequestStatus.PENDING,
                    ),

                    eq(
                        upgradeRequests.status,
                        UpgradeRequestStatus.UNDER_REVIEW,
                    ),
                ),
            )
            .orderBy(
                desc(
                    upgradeRequests.createdAt,
                ),
            );
    }

    /**
     * Return every request belonging
     * to a user.
     */
    async findByUser(
        executor: DbExecutor = db,
        userId: string,
    ) {
        return executor
            .select()
            .from(upgradeRequests)
            .where(
                eq(
                    upgradeRequests.userId,
                    userId,
                ),
            )
            .orderBy(
                desc(
                    upgradeRequests.createdAt,
                ),
            );
    }

    /**
     * Mark request as under review.
     */
    async markUnderReview(
        executor: DbExecutor = db,
        id: string,
        reviewedBy: string,
    ) {
        const [request] =
            await executor
                .update(upgradeRequests)
                .set({
                    status:
                        UpgradeRequestStatus.UNDER_REVIEW,

                    reviewedBy,

                    reviewedAt:
                        new Date(),
                })
                .where(
                    eq(
                        upgradeRequests.id,
                        id,
                    ),
                )
                .returning();

        return request;
    }

    /**
     * Approve request.
     */
    async approve(
        executor: DbExecutor = db,
        id: string,
        reviewedBy: string,
        transactionId?: string,
        adminNote?: string,
    ) {
        const [request] =
            await executor
                .update(upgradeRequests)
                .set({
                    status:
                        UpgradeRequestStatus.APPROVED,

                    reviewedBy,

                    reviewedAt:
                        new Date(),

                    transactionId,

                    adminNote,
                })
                .where(
                    and(
                        eq(
                            upgradeRequests.id,
                            id,
                        ),

                        eq(
                            upgradeRequests.status,
                            UpgradeRequestStatus.UNDER_REVIEW,
                        ),
                    ),
                )
                .returning();

        return request;
    }

    /**
     * Reject request.
     */
    async reject(
        executor: DbExecutor = db,
        id: string,
        reviewedBy: string,
        rejectedReason: string,
        adminNote?: string,
    ) {
        const [request] =
            await executor
                .update(upgradeRequests)
                .set({
                    status:
                        UpgradeRequestStatus.REJECTED,

                    reviewedBy,

                    reviewedAt:
                        new Date(),

                    rejectedReason,

                    adminNote,
                })
                .where(
                    and(
                        eq(
                            upgradeRequests.id,
                            id,
                        ),

                        eq(
                            upgradeRequests.status,
                            UpgradeRequestStatus.UNDER_REVIEW,
                        ),
                    ),
                )
                .returning();

        return request;
    }

    /**
     * Cancel request.
     */
    async cancel(
        executor: DbExecutor = db,
        id: string,
    ) {
        const [request] =
            await executor
                .update(upgradeRequests)
                .set({
                    status:
                        UpgradeRequestStatus.CANCELLED,
                })
                .where(
                    and(
                        eq(
                            upgradeRequests.id,
                            id,
                        ),

                        eq(
                            upgradeRequests.status,
                            UpgradeRequestStatus.PENDING,
                        ),
                    ),
                )
                .returning();

        return request;
    }

    /**
     * Find a user's pending request.
     */
    async findPendingByUser(
        executor: DbExecutor = db,
        userId: string,
    ) {
        const [request] =
            await executor
                .select()
                .from(upgradeRequests)
                .where(
                    and(
                        eq(
                            upgradeRequests.userId,
                            userId,
                        ),

                        or(
                            eq(
                                upgradeRequests.status,
                                UpgradeRequestStatus.PENDING,
                            ),

                            eq(
                                upgradeRequests.status,
                                UpgradeRequestStatus.UNDER_REVIEW,
                            ),
                        ),
                    ),
                )
                .limit(1);

        return request ?? null;
    }
}

export const upgradeRepository =
    new UpgradeRepository();