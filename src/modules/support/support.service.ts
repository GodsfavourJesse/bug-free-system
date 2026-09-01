// support.service.ts

import { db } from "../../database";
import { NotificationType } from "../../database/enums/notification.enum";
import { notificationService } from "../notification/notification.service";

import {
    supportRepository,
} from "./support.repository";

import {
    supportValidation,
} from "./support.validation";

export class SupportService {

    // ========================================================
    // USER SUPPORT
    // ========================================================

    /**
     * Get or create the authenticated user's
     * support conversation.
     *
     * A user can only access their own conversation.
     */
    async getOrCreateUserConversation(
        userId: string,
    ) {

        const existing =
            await supportRepository
                .findConversationByUserId(
                    db,
                    userId,
                );

        if (existing) {
            return existing;
        }

        return supportRepository
            .createConversation(
                db,
                userId,
            );
    }

    /**
     * Get the authenticated user's
     * support conversation.
     *
     * If the user does not have one yet,
     * it will be created automatically.
     */
    async getUserConversation(
        userId: string,
    ) {

        return this.getOrCreateUserConversation(
            userId,
        );
    }

    /**
     * Get messages belonging to the
     * authenticated user's conversation.
     */
    async getUserMessages(
        userId: string,
    ) {

        const conversation =
            await this.getOrCreateUserConversation(
                userId,
            );

        return supportRepository
            .findMessages(
                db,
                conversation.id,
            );
    }

    /**
     * Send a message as the authenticated user.
     *
     * senderId and senderType are NEVER
     * accepted from the client.
     */
    async sendUserMessage(
        userId: string,
        message: string,
    ) {

        const validatedMessage =
            supportValidation.validateMessage(
                message,
            );

        const conversation =
            await this.getOrCreateUserConversation(
                userId,
            );

        supportValidation
            .ensureConversationIsOpen(
                conversation.status,
            );

        return db.transaction(
            async (tx) => {

                const createdMessage =
                    await supportRepository
                        .createMessage(
                            tx,
                            {
                                conversationId:
                                    conversation.id,

                                senderId:
                                    userId,

                                senderType:
                                    "user",

                                message:
                                    validatedMessage,

                                isRead:
                                    false,
                            },
                        );

                /**
                 * Notify the admin side that
                 * there is a new unread message.
                 */
                await supportRepository.incrementAdminUnreadCount(
                    tx,
                    conversation.id,
                );

                await notificationService.notifyAdmins(
                    tx,
                    {
                        title: "New Support Message",

                        message:
                            "A user has sent a new message to support.",

                        type: NotificationType.SUPPORT,

                        metadata: {
                            conversationId: conversation.id,

                            userId,

                            messageId: createdMessage.id,
                        },
                    },
                );

                return createdMessage;
            },
        );
    }

    /**
     * Mark admin messages as read when
     * the authenticated user opens
     * their support conversation.
     */
    async markUserConversationAsRead(
        userId: string,
    ) {

        const conversation =
            await this.getOrCreateUserConversation(
                userId,
            );

        await db.transaction(
            async (tx) => {

                /**
                 * Mark all messages sent by
                 * admins as read.
                 */
                await supportRepository
                    .markAdminMessagesAsRead(
                        tx,
                        conversation.id,
                    );

                /**
                 * Reset the user's unread
                 * message counter.
                 */
                await supportRepository
                    .resetUserUnreadCount(
                        tx,
                        conversation.id,
                    );
            },
        );
    }
}

export const supportService =
    new SupportService();