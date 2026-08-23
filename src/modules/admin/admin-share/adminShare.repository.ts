import { and, count, desc, eq, ilike } from "drizzle-orm";
import { db } from "../../../database";
import { sharePurchases, shares } from "../../../database/schema";
import { DbExecutor } from "../../../database/types/types";
import { ShareStatus } from "../../../database/enums/share.enum";

export class AdminShareRepository {

    // CREATE SHARE
    async create(
        executor: DbExecutor = db,
        data: typeof shares.$inferInsert,
    ) {
        const [share] = await executor
            .insert(shares)
            .values(data)
            .returning();

        return share;
    }

    // FIND SHARE BY ID
    async findById(
        executor: DbExecutor = db,
        shareId: string,
    ) {
        const [share] = await executor
            .select()
            .from(shares)
            .where(
                eq(
                    shares.id,
                    shareId,
                ),
            )
            .limit(1);

        return share ?? null;
    }

    // FIND SHARE BY NAME
    async findByName(
        executor: DbExecutor = db,
        name: string,
    ) {
        const [share] = await executor
            .select()
            .from(shares)
            .where(
                eq(
                    shares.name,
                    name,
                ),
            )
            .limit(1);

        return share ?? null;
    }

    // Check whether a share has any purchase history.
    // This is used to protect investment history from deletion.
    async hasPurchases(
        executor: DbExecutor = db,
        shareId: string,
    ): Promise<boolean> {

        const [result] = await executor
            .select({
                count:
                    count(
                        sharePurchases.id,
                    ),
            })
            .from(sharePurchases)
            .where(
                 eq(
                    sharePurchases.shareId,
                    shareId,
                ),
            );

        return Number(
            result?.count ?? 0,
        ) > 0;
    }

    // PAGINATED ADMIN SHARE LIST
    async findAll(
        executor: DbExecutor = db,
        page: number = 1,
        limit: number = 20,
        options?: {
            status?: ShareStatus;
            search?: string;
        },
    ) {
        const offset = (page - 1) * limit;

        // Build filters dynamically.
        const filters = [];

        // filter by status.
        if (
            options?.status !== undefined
        ) {
            filters.push(
                eq(
                    shares.status,
                    options.status,
                ),
            );
        }

        // Search by share name.
        if (
            options?.search
        ) {
            filters.push(
                ilike(
                    shares.name,
                    `%${options.search}%`,
                ),
            );
        }

        // Combine filters only when filters exist.
        const whereClause = filters.length > 0
            ? and(...filters)
            : undefined;

        // Fetch paginated data.
        const data = await executor
            .select({
                id: shares.id,
                name: shares.name,
                logo: shares.logo,
                description: shares.description,
                dailyReturnPercentage: shares.dailyReturnPercentage,
                cycleDays: shares.cycleDays,
                status: shares.status,
                createdAt: shares.createdAt,
                updatedAt: shares.updatedAt,
            })
            .from(shares)
            .where(
                whereClause,
            )
            .orderBy(
                desc(
                    shares.createdAt,
                ),
            )
            .limit(limit)
            .offset(offset);

        // Count records using exactly the same filters.
        // IMPORTANT:
        // The count must use the same WHERE clause a the list query.
        const [{ total }] = await executor
            .select({
                total: count(),
            })
            .from(shares)
            .where(
                whereClause,
            );

        return {
            data,
            total: Number(total),
        };
    }

    // UPDATE SHARE
    async update(
        executor: DbExecutor = db,
        shareId: string,
        data: Partial<
            typeof shares.$inferInsert
        >,
    ) {
        const [share] = await executor
            .update(shares)
            .set(data)
            .where(
                eq(
                    shares.id,
                    shareId,
                ),
            )
            .returning();

        return share ?? null;
    }

    // UPDATE SHARE STATUS
    async updateStatus(
        executor: DbExecutor = db,
        shareId: string,
        status: ShareStatus,
        timestamps?: {
            startedAt?: Date;
            closedAt?: Date | null;
        },
    ) {
        const updateData: Partial<
            typeof shares.$inferInsert
        > = {
            status,
        };

        if (
            timestamps?.startedAt !== undefined
        ) {
            updateData.startedAt =
                timestamps.startedAt;
        }

        if (
            timestamps?.closedAt !== undefined
        ) {
            updateData.closedAt =
                timestamps.closedAt;
        }

        const [share] = await executor
            .update(shares)
            .set(updateData)
            .where(
                eq(
                    shares.id,
                    shareId,
                ),
            )
            .returning();

        return share ?? null;
    }

    // DELETE SHARE
    // The delete layer must veriy that the share has no purchase history before calling this method.
    async delete(
        executor: DbExecutor = db,
        shareId: string,
    ) {
        const [share] = await executor
            .delete(shares)
            .where(
                eq(
                    shares.id,
                    shareId,
                ),
            )
            .returning();

        return share ?? null;
    }
}

export const adminShareRepository = new AdminShareRepository();