import {
    and,
    eq,
    sql,
} from "drizzle-orm";

import {
    db,
} from "../../database";

import {
    DbExecutor,
} from "../../database/types/types";

import {
    supportConversations,
    supportMessages,
} from "../../database/schema";

export class SupportRepository {

    // ============================================================
    // CONVERSATIONS
    // ============================================================

    /**
     * Find the authenticated user's conversation.
     */
    async findConversationByUserId(
        executor: DbExecutor = db,
        userId: string,
    ) {

        const [conversation] =
            await executor
                .select()
                .from(
                    supportConversations,
                )
                .where(
                    eq(
                        supportConversations.userId,
                        userId,
                    ),
                )
                .limit(1);

        return conversation ?? null;
    }

    /**
     * Create a support conversation.
     */
    async createConversation(
        executor: DbExecutor = db,
        userId: string,
    ) {

        const [conversation] =
            await executor
                .insert(
                    supportConversations,
                )
                .values({
                    userId,
                    status: "open",
                    lastMessageAt: new Date(),
                    userUnreadCount: 0,
                    adminUnreadCount: 0,
                })
                .returning();

        return conversation;
    }

    // ============================================================
    // MESSAGES
    // ============================================================

    /**
     * Get messages for a user's conversation.
     */
    async findMessages(
        executor: DbExecutor = db,
        conversationId: string,
    ) {

        return executor
            .select({
                id:
                    supportMessages.id,

                conversationId:
                    supportMessages.conversationId,

                senderId:
                    supportMessages.senderId,

                senderType:
                    supportMessages.senderType,

                message:
                    supportMessages.message,

                isRead:
                    supportMessages.isRead,

                readAt:
                    supportMessages.readAt,

                createdAt:
                    supportMessages.createdAt,
            })
            .from(
                supportMessages,
            )
            .where(
                eq(
                    supportMessages.conversationId,
                    conversationId,
                ),
            )
            .orderBy(
                supportMessages.createdAt,
            );
    }

    /**
     * Create a user message.
     */
    async createMessage(
        executor: DbExecutor = db,
        data: typeof supportMessages.$inferInsert,
    ) {

        const [message] =
            await executor
                .insert(
                    supportMessages,
                )
                .values(data)
                .returning();

        return message;
    }

    /**
     * Mark admin messages as read by user.
     */
    async markAdminMessagesAsRead(
        executor: DbExecutor = db,
        conversationId: string,
    ) {

        await executor
            .update(
                supportMessages,
            )
            .set({
                isRead: true,
                readAt: new Date(),
            })
            .where(
                and(
                    eq(
                        supportMessages.conversationId,
                        conversationId,
                    ),
                    eq(
                        supportMessages.senderType,
                        "admin",
                    ),
                    eq(
                        supportMessages.isRead,
                        false,
                    ),
                ),
            );
    }

    /**
     * Reset user's unread count.
     */
    async resetUserUnreadCount(
        executor: DbExecutor = db,
        conversationId: string,
    ) {

        await executor
            .update(
                supportConversations,
            )
            .set({
                userUnreadCount: 0,
                updatedAt: new Date(),
            })
            .where(
                eq(
                    supportConversations.id,
                    conversationId,
                ),
            );
    }

    /**
     * Increment admin unread count.
     */
    async incrementAdminUnreadCount(
        executor: DbExecutor = db,
        conversationId: string,
    ) {

        await executor
            .update(
                supportConversations,
            )
            .set({
                adminUnreadCount:
                    sql`${supportConversations.adminUnreadCount} + 1`,

                lastMessageAt:
                    new Date(),

                updatedAt:
                    new Date(),
            })
            .where(
                eq(
                    supportConversations.id,
                    conversationId,
                ),
            );
    }
}

export const supportRepository =
    new SupportRepository();