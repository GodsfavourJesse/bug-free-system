import {
    and,
    desc,
    eq,
} from "drizzle-orm";

import {
    DbExecutor,
} from "../../database/types/types";

import {
    notifications,
    users,
} from "../../database/schema";

export class NotificationRepository {

    /**
     * Find all active users.
     *
     * Used for system-wide notifications.
     */
    async findUsers(
        executor: DbExecutor,
    ) {

        return executor
            .select({
                id: users.id,
            })
            .from(users)
            .where(
                and(
                    eq(
                        users.role,
                        "user",
                    ),
                    eq(
                        users.isActive,
                        true,
                    ),
                ),
            );
    }

    /**
     * Find all active administrators.
     *
     * Used when a business event needs to
     * notify every administrator.
     */
    async findAdmins(
        executor: DbExecutor,
    ) {

        return executor
            .select({
                id: users.id,
            })
            .from(users)
            .where(
                and(
                    eq(
                        users.role,
                        "admin",
                    ),
                    eq(
                        users.isActive,
                        true,
                    ),
                ),
            );
    }


    /**
     * Find an active user by ID.
     *
     * Used before creating a user notification.
     */
    async findActiveUserById(
        executor: DbExecutor,
        userId: string,
    ) {

        const [user] =
            await executor
                .select({
                    id: users.id,
                    role: users.role,
                    isActive: users.isActive,
                })
                .from(users)
                .where(
                    and(
                        eq(
                            users.id,
                            userId,
                        ),
                        eq(
                            users.isActive,
                            true,
                        ),
                    ),
                )
                .limit(1);

        return user ?? null;
    }

    /**
     * Create notification.
     */
    async create(
        executor: DbExecutor,
        data: typeof notifications.$inferInsert,
    ) {

        const [notification] =
            await executor
                .insert(notifications)
                .values(data)
                .returning();

        return notification;
    }

    /**
     * Find notification by ID
     * belonging to a specific user.
     */
    async findByIdForUser(
        executor: DbExecutor,
        id: string,
        userId: string,
    ) {

        const [notification] =
            await executor
                .select()
                .from(notifications)
                .where(
                    and(
                        eq(
                            notifications.id,
                            id,
                        ),
                        eq(
                            notifications.userId,
                            userId,
                        ),
                    ),
                )
                .limit(1);

        return notification ?? null;
    }

    /**
     * Find all notifications for a user.
     */
    async findByUser(
        executor: DbExecutor,
        userId: string,
    ) {

        return executor
            .select()
            .from(notifications)
            .where(
                eq(
                    notifications.userId,
                    userId,
                ),
            )
            .orderBy(
                desc(
                    notifications.createdAt,
                ),
            );
    }

    /**
     * Find unread notifications.
     */
    async findUnread(
        executor: DbExecutor,
        userId: string,
    ) {

        return executor
            .select()
            .from(notifications)
            .where(
                and(
                    eq(
                        notifications.userId,
                        userId,
                    ),
                    eq(
                        notifications.isRead,
                        false,
                    ),
                ),
            )
            .orderBy(
                desc(
                    notifications.createdAt,
                ),
            );
    }

    /**
     * Mark one user's notification as read.
     *
     * Ownership is enforced at repository level.
     */
    async markAsRead(
        executor: DbExecutor,
        id: string,
        userId: string,
    ) {

        const [notification] =
            await executor
                .update(notifications)
                .set({
                    isRead: true,
                    readAt: new Date(),
                })
                .where(
                    and(
                        eq(
                            notifications.id,
                            id,
                        ),
                        eq(
                            notifications.userId,
                            userId,
                        ),
                    ),
                )
                .returning();

        return notification ?? null;
    }

    /**
     * Mark all user's notifications as read.
     */
    async markAllAsRead(
        executor: DbExecutor,
        userId: string,
    ) {

        await executor
            .update(notifications)
            .set({
                isRead: true,
                readAt: new Date(),
            })
            .where(
                and(
                    eq(
                        notifications.userId,
                        userId,
                    ),
                    eq(
                        notifications.isRead,
                        false,
                    ),
                ),
            );
    }

    /**
     * Delete one user's notification.
     *
     * Ownership is enforced at repository level.
     */
    async delete(
        executor: DbExecutor,
        id: string,
        userId: string,
    ) {

        await executor
            .delete(notifications)
            .where(
                and(
                    eq(
                        notifications.id,
                        id,
                    ),
                    eq(
                        notifications.userId,
                        userId,
                    ),
                ),
            );
    }

    /**
     * Delete every notification
     * belonging to a user.
     */
    async deleteAll(
        executor: DbExecutor,
        userId: string,
    ) {

        await executor
            .delete(notifications)
            .where(
                eq(
                    notifications.userId,
                    userId,
                ),
            );
    }
}

export const notificationRepository =
    new NotificationRepository();