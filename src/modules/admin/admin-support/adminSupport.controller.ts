import {
    NextFunction,
    Request,
    Response,
} from "express";

import {
    adminSupportService,
} from "./adminSupport.service";

export class AdminSupportController {

    // ============================================================
    // CONVERSATIONS
    // ============================================================

    /**
     * Get all support conversations.
     *
     * GET /api/v1/admin/support/conversations
     */
    async getAllConversations(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {

        try {

            const conversations =
                await adminSupportService
                    .getAllConversations();

            return res.status(200).json({
                success: true,
                data: conversations,
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get one support conversation.
     *
     * GET /api/v1/admin/support/conversations/:conversationId
     */
    async getConversation(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {

        try {

            const conversationId =
                String(
                    req.params.conversationId,
                );

            const conversation =
                await adminSupportService
                    .getConversation(
                        conversationId,
                    );

            return res.status(200).json({
                success: true,
                data: conversation,
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get conversation messages.
     *
     * GET /api/v1/admin/support/conversations/:conversationId/messages
     */
    async getConversationMessages(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {

        try {

            const conversationId =
                String(
                    req.params.conversationId,
                );

            const messages =
                await adminSupportService
                    .getConversationMessages(
                        conversationId,
                    );

            return res.status(200).json({
                success: true,
                data: messages,
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Mark conversation as read.
     *
     * PATCH /api/v1/admin/support/conversations/:conversationId/read
     */
    async markConversationAsRead(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {

        try {

            const conversationId =
                String(
                    req.params.conversationId,
                );

            await adminSupportService
                .markConversationAsRead(
                    conversationId,
                );

            return res.status(200).json({
                success: true,
                message:
                    "Messages marked as read.",
            });

        } catch (error) {
            next(error);
        }
    }

    // ============================================================
    // MESSAGES
    // ============================================================

    /**
     * Send admin message.
     *
     * POST /api/v1/admin/support/conversations/:conversationId/messages
     */
    async sendMessage(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {

        try {

            const conversationId =
                String(
                    req.params.conversationId,
                );

            const {
                message,
            } = req.body;

            const created =
                await adminSupportService
                    .sendMessage(
                        req.user!.id,
                        conversationId,
                        message,
                    );

            return res.status(201).json({
                success: true,
                message:
                    "Message sent successfully.",
                data: created,
            });

        } catch (error) {
            next(error);
        }
    }

    // ============================================================
    // STATUS
    // ============================================================

    /**
     * Close or reopen conversation.
     *
     * PATCH /api/v1/admin/support/conversations/:conversationId/status
     */
    async updateConversationStatus(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {

        try {

            const conversationId =
                String(
                    req.params.conversationId,
                );

            const {
                status,
            } = req.body;

            const conversation =
                await adminSupportService
                    .updateConversationStatus(
                        conversationId,
                        status,
                    );

            return res.status(200).json({
                success: true,
                message:
                    "Conversation status updated.",
                data: conversation,
            });

        } catch (error) {
            next(error);
        }
    }
}

export const adminSupportController =
    new AdminSupportController();