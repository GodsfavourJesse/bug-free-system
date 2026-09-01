import {
    db,
} from "../../../database";
import { SupportConversationNotFoundError } from "../../support/support.errors";
import { supportValidation } from "../../support/support.validation";

import {
    adminSupportRepository,
} from "./adminSupport.repository";


export class AdminSupportService {

    // ============================================================
    // CONVERSATIONS
    // ============================================================

    /**
     * Get all support conversations.
     */
    async getAllConversations() {

        return adminSupportRepository
            .findAllConversations(
                db,
            );
    }

    /**
     * Get one support conversation.
     */
    async getConversation(
        conversationId: string,
    ) {

        const conversation =
            await adminSupportRepository
                .findConversationById(
                    db,
                    conversationId,
                );

        if (!conversation) {
            throw new SupportConversationNotFoundError();
        }

        return conversation;
    }

    /**
     * Get messages for a conversation.
     */
    async getConversationMessages(
        conversationId: string,
    ) {

        const conversation =
            await this.getConversation(
                conversationId,
            );

        return adminSupportRepository
            .findConversationMessages(
                db,
                conversation.id,
            );
    }

    /**
     * Mark user messages as read.
     */
    async markConversationAsRead(
        conversationId: string,
    ) {

        await this.getConversation(
            conversationId,
        );

        await db.transaction(
            async (tx) => {

                await adminSupportRepository
                    .markUserMessagesAsRead(
                        tx,
                        conversationId,
                    );

                await adminSupportRepository
                    .resetAdminUnreadCount(
                        tx,
                        conversationId,
                    );
            },
        );
    }

    // ============================================================
    // MESSAGES
    // ============================================================

    /**
     * Send message from admin to user.
     */
    async sendMessage(
        adminId: string,
        conversationId: string,
        message: string,
    ) {

        const validatedMessage =
            supportValidation.validateMessage(
                message,
            );

        const conversation =
            await this.getConversation(
                conversationId,
            );

        supportValidation
            .ensureConversationIsOpen(
                conversation.status,
            );

        return db.transaction(
            async (tx) => {

                const created =
                    await adminSupportRepository
                        .createAdminMessage(
                            tx,
                            {
                                conversationId:
                                    conversation.id,

                                senderId:
                                    adminId,

                                senderType:
                                    "admin",

                                message:
                                    validatedMessage,

                                isRead:
                                    false,
                            },
                        );

                await adminSupportRepository
                    .incrementUserUnreadCount(
                        tx,
                        conversation.id,
                    );

                return created;
            },
        );
    }

    // ============================================================
    // STATUS
    // ============================================================

    /**
     * Close or reopen conversation.
     */
    async updateConversationStatus(
        conversationId: string,
        status: string,
    ) {

        const validatedStatus =
            supportValidation
                .validateStatus(status);

        await this.getConversation(
            conversationId,
        );

        return adminSupportRepository
            .updateConversationStatus(
                db,
                conversationId,
                validatedStatus,
            );
    }
}

export const adminSupportService =
    new AdminSupportService();