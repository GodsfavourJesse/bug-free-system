// support.controller.ts

import {
    NextFunction,
    Request,
    Response,
} from "express";

import {
    supportService,
} from "./support.service";

export class SupportController {

    // ============================================================
    // USER
    // ============================================================

    /**
     * Get or create the authenticated user's
     * support conversation.
     *
     * GET /api/v1/support/me
     */
    async getMyConversation(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {

        try {

            const conversation =
                await supportService
                    .getUserConversation(
                        req.user!.id,
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
     * Get messages for the authenticated user.
     *
     * GET /api/v1/support/me/messages
     */
    async getMyMessages(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {

        try {

            const messages =
                await supportService
                    .getUserMessages(
                        req.user!.id,
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
     * Send a message as the authenticated user.
     *
     * POST /api/v1/support/me/messages
     */
    async sendUserMessage(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {

        try {

            const {
                message,
            } = req.body;

            const created =
                await supportService
                    .sendUserMessage(
                        req.user!.id,
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

    /**
     * Mark admin messages as read
     * for the authenticated user.
     *
     * PATCH /api/v1/support/me/read
     */
    async markUserAsRead(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {

        try {

            await supportService
                .markUserConversationAsRead(
                    req.user!.id,
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
}

export const supportController =
    new SupportController();