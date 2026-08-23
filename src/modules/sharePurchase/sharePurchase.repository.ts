import { and, desc, eq } from "drizzle-orm";
import { db } from "../../database";
import { sharePurchases, shares } from "../../database/schema";
import { DbExecutor } from "../../database/types/types";
import { sharePurchaseStatus } from "../../database/enums/share.enum";

export class SharePurchaseRepository {

    /**
     * Create purchase.
     */
    async create(
        executor: DbExecutor = db,
        data: typeof sharePurchases.$inferInsert,
    ) {
        const [purchase] =
            await executor
                .insert(sharePurchases)
                .values(data)
                .returning();

        return purchase;
    }

    /**
     * Find purchase by ID.
     */
    async findById(
        executor: DbExecutor = db,
        id: string,
    ) {
        const [purchase] =
            await executor
                .select()
                .from(sharePurchases)
                .where(
                    eq(
                        sharePurchases.id,
                        id,
                    ),
                )
                .limit(1);

        return purchase ?? null;
    }

    /**
     * Find user's purchase.
     */
    async findByUser(
        executor: DbExecutor = db,
        userId: string,
    ) {
        return executor
            .select()
            .from(sharePurchases)
            .where(
                eq(
                    sharePurchases.userId,
                    userId,
                ),
            )
            .orderBy(
                desc(
                    sharePurchases.createdAt,
                ),
            );
    }

}

export const sharePurchaseRepository = new SharePurchaseRepository();