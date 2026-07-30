import { and, count, desc, eq, gte, lt, sql } from "drizzle-orm";
import { DbExecutor } from "../../database/types/types";
import { db } from "../../database";
import { completedAdvertisements } from "../../database/schema";


export class CompletedAdvertisementRepository {

    /**
     * Create a completed advertisement record.
     */
    async create(
        executor: DbExecutor = db,
        data: typeof completedAdvertisements.$inferInsert,
    ) {
        const [completedAdvertisement] =
            await executor
                .insert(completedAdvertisements)
                .values(data)
                .returning();

        return completedAdvertisement;
    }

    /**
     * Find a user's completion for a specific advertisement.
     */
    async findByUserAndAdvertisement(
        executor: DbExecutor = db,
        userId: string,
        advertisementId: string,
    ) {
        const [completedAdvertisement] =
            await executor
                .select()
                .from(completedAdvertisements)
                .where(
                    and(
                        eq(
                            completedAdvertisements.userId,
                            userId,
                        ),
                        eq(
                            completedAdvertisements.advertisementId,
                            advertisementId,
                        ),
                    ),
                )
                .limit(1);

        return completedAdvertisement ?? null;
    }

    /**
     * Find all completed advertisements for a user.
     */
    async findByUser(
        executor: DbExecutor = db,
        userId: string,
    ) {
        return executor
            .select()
            .from(completedAdvertisements)
            .where(
                eq(
                    completedAdvertisements.userId,
                    userId,
                ),
            )
            .orderBy(
                desc(
                    completedAdvertisements.completedAt,
                ),
            );
    }

    /**
     * Count completions for an advertisement.
     */
    async countByAdvertisement(
        executor: DbExecutor = db,
        advertisementId: string,
    ) {
        const [result] =
            await executor
                .select({
                    count: count(),
                })
                .from(completedAdvertisements)
                .where(
                    eq(
                        completedAdvertisements.advertisementId,
                        advertisementId,
                    ),
                );

        return result.count;
    }

    async countCompletedToday(
        executor: DbExecutor = db,
        userId: string,
    ) {
        const startOfToday = new Date();

        startOfToday.setHours(
            0,
            0,
            0,
            0,
        );

        const startOfTomorrow =
            new Date(startOfToday);

        startOfTomorrow.setDate(
            startOfTomorrow.getDate() + 1,
        );

        const [{ count }] =
            await executor
                .select({
                    count: sql<number>`count(*)`,
                })
                .from(
                    completedAdvertisements,
                )
                .where(
                    and(
                        eq(
                            completedAdvertisements.userId,
                            userId,
                        ),
                        gte(
                            completedAdvertisements.completedAt,
                            startOfToday,
                        ),
                        lt(
                            completedAdvertisements.completedAt,
                            startOfTomorrow,
                        ),
                    ),
                );

        return Number(count);
    }
}

export const completedAdvertisementRepository = new CompletedAdvertisementRepository();