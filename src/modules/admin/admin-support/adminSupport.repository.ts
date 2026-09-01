import {
    and,
    desc,
    eq,
    sql,
} from "drizzle-orm";

import {
    db,
} from "../../../database";

import {
    DbExecutor,
} from "../../../database/types/types";

import {
    supportConversations,
    supportMessages,
    users,
} from "../../../database/schema";

export class AdminSupportRepository {

    // ============================================================
    // CONVERSATIONS
    // ============================================================

    /**
     * Find all support conversations.
     *
     * Admin only.
     */
    async findAllConversations(
        executor: DbExecutor = db,
    ) {

        return executor
            .select({
                id:
                    supportConversations.id,

                userId:
                    supportConversations.userId,

                status:
                    supportConversations.status,

                lastMessageAt:
                    supportConversations.lastMessageAt,

                userUnreadCount:
                    supportConversations.userUnreadCount,

                adminUnreadCount:
                    supportConversations.adminUnreadCount,

                createdAt:
                    supportConversations.createdAt,

                updatedAt:
                    supportConversations.updatedAt,

                userPhone:
                    users.phone,

                userEmail:
                    users.email,

                userReferralCode:
                    users.referralCode,
            })
            .from(
                supportConversations,
            )
            .innerJoin(
                users,
                eq(
                    users.id,
                    supportConversations.userId,
                ),
            )
            .orderBy(
                desc(
                    supportConversations.lastMessageAt,
                ),
            );
    }

    /**
     * Find one conversation.
     *
     * Admin only.
     */
    async findConversationById(
        executor: DbExecutor = db,
        conversationId: string,
    ) {

        const [conversation] =
            await executor
                .select({
                    id:
                        supportConversations.id,

                    userId:
                        supportConversations.userId,

                    status:
                        supportConversations.status,

                    lastMessageAt:
                        supportConversations.lastMessageAt,

                    userUnreadCount:
                        supportConversations.userUnreadCount,

                    adminUnreadCount:
                        supportConversations.adminUnreadCount,

                    createdAt:
                        supportConversations.createdAt,

                    updatedAt:
                        supportConversations.updatedAt,

                    userPhone:
                        users.phone,

                    userEmail:
                        users.email,

                    userReferralCode:
                        users.referralCode,
                })
                .from(
                    supportConversations,
                )
                .innerJoin(
                    users,
                    eq(
                        users.id,
                        supportConversations.userId,
                    ),
                )
                .where(
                    eq(
                        supportConversations.id,
                        conversationId,
                    ),
                )
                .limit(1);

        return conversation ?? null;
    }

    /**
     * Update conversation status.
     */
    async updateConversationStatus(
        executor: DbExecutor = db,
        conversationId: string,
        status: "open" | "closed",
    ) {

        const [conversation] =
            await executor
                .update(
                    supportConversations,
                )
                .set({
                    status,
                    updatedAt: new Date(),
                })
                .where(
                    eq(
                        supportConversations.id,
                        conversationId,
                    ),
                )
                .returning();

        return conversation ?? null;
    }

    // ============================================================
    // MESSAGES
    // ============================================================

    /**
     * Get all messages for an admin conversation view.
     */
    async findConversationMessages(
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

                senderPhone:
                    users.phone,

                senderEmail:
                    users.email,
            })
            .from(
                supportMessages,
            )
            .innerJoin(
                users,
                eq(
                    users.id,
                    supportMessages.senderId,
                ),
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
     * Create an admin message.
     */
    async createAdminMessage(
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
     * Mark user messages as read.
     */
    async markUserMessagesAsRead(
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
                        "user",
                    ),
                    eq(
                        supportMessages.isRead,
                        false,
                    ),
                ),
            );
    }

    /**
     * Reset admin unread counter.
     */
    async resetAdminUnreadCount(
        executor: DbExecutor = db,
        conversationId: string,
    ) {

        await executor
            .update(
                supportConversations,
            )
            .set({
                adminUnreadCount: 0,
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
     * Increment user unread counter.
     */
    async incrementUserUnreadCount(
        executor: DbExecutor = db,
        conversationId: string,
    ) {

        await executor
            .update(
                supportConversations,
            )
            .set({
                userUnreadCount:
                    sql`${supportConversations.userUnreadCount} + 1`,

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

export const adminSupportRepository =
    new AdminSupportRepository();