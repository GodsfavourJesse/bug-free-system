import { and, desc,
    eq,
} from "drizzle-orm";

import { DbExecutor } from "@/database/types/types";

import { notifications } from "@/database/schema";
import { users } from "@/database/schema";

export class NotificationRepository {


    async findAdmins(
        executor: DbExecutor,
    ) {
        return executor
            .select()
            .from(users)
            .where(
                eq(
                    users.role,
                    "admin",
                ),
            );
    }

    // Create notification.
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

    // Find notification by ID.
    async findById(
        executor: DbExecutor,
        id: string,
    ) {

        const [notification] =
            await executor
                .select()
                .from(notifications)
                .where(
                    eq(
                        notifications.id,
                        id,
                    ),
                )
                .limit(1);

        return notification ?? null;
    }

    // Find all notifications for a user.
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

    // Find unread notifications.
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

    // Mark notification as read.
    async markAsRead(
        executor: DbExecutor,
        id: string,
    ) {

        const [notification] =
            await executor
                .update(notifications)
                .set({
                    isRead: true,
                    readAt: new Date(),
                })
                .where(
                    eq(
                        notifications.id,
                        id,
                    ),
                )
                .returning();

        return notification;
    }

    // Mark every notification as read.
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
                eq(
                    notifications.userId,
                    userId,
                ),
            );
    }

    // Delete one notification.
    async delete(
        executor: DbExecutor,
        id: string,
    ) {

        await executor
            .delete(notifications)
            .where(
                eq(
                    notifications.id,
                    id,
                ),
            );
    }

    // Delete every notification for a user.
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