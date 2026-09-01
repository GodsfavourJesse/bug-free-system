import {
    and,
    desc,
    eq,
} from "drizzle-orm";

import {
    corporateAnnouncementReads,
    corporateAnnouncements,
} from "../../database/schema";

import { DbExecutor } from "../../database/types/types";

export class CorporateRepository {

    // ========================================================
    // ANNOUNCEMENTS
    // ========================================================

    async createAnnouncement(
        executor: DbExecutor,
        data: typeof corporateAnnouncements.$inferInsert,
    ) {

        const [announcement] =
            await executor
                .insert(corporateAnnouncements)
                .values(data)
                .returning();

        return announcement;
    }

    async findById(
        executor: DbExecutor,
        id: string,
    ) {

        const [announcement] =
            await executor
                .select()
                .from(corporateAnnouncements)
                .where(
                    eq(
                        corporateAnnouncements.id,
                        id,
                    ),
                )
                .limit(1);

        return announcement ?? null;
    }

    /**
     * All announcements for admin.
     */
    async findAll(
        executor: DbExecutor,
    ) {

        return executor
            .select()
            .from(corporateAnnouncements)
            .orderBy(
                desc(
                    corporateAnnouncements.createdAt,
                ),
            );
    }

    /**
     * Only published announcements.
     *
     * Used by users.
     */
    async findPublished(
        executor: DbExecutor,
    ) {

        return executor
            .select()
            .from(corporateAnnouncements)
            .where(
                eq(
                    corporateAnnouncements.isPublished,
                    true,
                ),
            )
            .orderBy(
                desc(
                    corporateAnnouncements.publishedAt,
                ),
            );
    }

    async updateAnnouncement(
        executor: DbExecutor,
        id: string,
        data: Partial<
            typeof corporateAnnouncements.$inferInsert
        >,
    ) {

        const [announcement] =
            await executor
                .update(corporateAnnouncements)
                .set({
                    ...data,
                    updatedAt: new Date(),
                })
                .where(
                    eq(
                        corporateAnnouncements.id,
                        id,
                    ),
                )
                .returning();

        return announcement ?? null;
    }

    async deleteAnnouncement(
        executor: DbExecutor,
        id: string,
    ) {

        await executor
            .delete(corporateAnnouncements)
            .where(
                eq(
                    corporateAnnouncements.id,
                    id,
                ),
            );
    }

    // ========================================================
    // READ STATUS
    // ========================================================

    async findRead(
        executor: DbExecutor,
        announcementId: string,
        userId: string,
    ) {

        const [read] =
            await executor
                .select()
                .from(corporateAnnouncementReads)
                .where(
                    and(
                        eq(
                            corporateAnnouncementReads.announcementId,
                            announcementId,
                        ),
                        eq(
                            corporateAnnouncementReads.userId,
                            userId,
                        ),
                    ),
                )
                .limit(1);

        return read ?? null;
    }

    async markAsRead(
        executor: DbExecutor,
        data: typeof corporateAnnouncementReads.$inferInsert,
    ) {

        const [read] =
            await executor
                .insert(
                    corporateAnnouncementReads,
                )
                .values(data)
                .onConflictDoNothing({
                    target: [
                        corporateAnnouncementReads.announcementId,
                        corporateAnnouncementReads.userId,
                    ],
                })
                .returning();

        return read ?? null;
    }

    /**
     * Get announcements together with
     * the user's read status.
     */
    async findPublishedForUser(
        executor: DbExecutor,
        userId: string,
    ) {

        return executor
            .select({
                id:
                    corporateAnnouncements.id,

                title:
                    corporateAnnouncements.title,

                message:
                    corporateAnnouncements.message,

                publishedAt:
                    corporateAnnouncements.publishedAt,

                createdAt:
                    corporateAnnouncements.createdAt,

                isRead:
                    corporateAnnouncementReads.id,
            })
            .from(corporateAnnouncements)
            .leftJoin(
                corporateAnnouncementReads,
                and(
                    eq(
                        corporateAnnouncementReads.announcementId,
                        corporateAnnouncements.id,
                    ),
                    eq(
                        corporateAnnouncementReads.userId,
                        userId,
                    ),
                ),
            )
            .where(
                eq(
                    corporateAnnouncements.isPublished,
                    true,
                ),
            )
            .orderBy(
                desc(
                    corporateAnnouncements.publishedAt,
                ),
            );
    }
}

export const corporateRepository =
    new CorporateRepository();