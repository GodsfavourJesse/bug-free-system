// support.routes.ts

import { Router } from "express";

import {
    supportController,
} from "./support.controller";

import {
    authenticate,
} from "../../middlewares/auth.middleware";

const router = Router();

/**
 * All user support endpoints require authentication.
 */
router.use(authenticate);

// ============================================================
// USER SUPPORT
// ============================================================

/**
 * Get/create current user's conversation.
 *
 * GET /api/v1/support/me
 */
router.get(
    "/me",
    supportController
        .getMyConversation
        .bind(supportController),
);

/**
 * Get current user's messages.
 *
 * GET /api/v1/support/me/messages
 */
router.get(
    "/me/messages",
    supportController
        .getMyMessages
        .bind(supportController),
);

/**
 * Send message as current user.
 *
 * POST /api/v1/support/me/messages
 */
router.post(
    "/me/messages",
    supportController
        .sendUserMessage
        .bind(supportController),
);

/**
 * Mark admin messages as read.
 *
 * PATCH /api/v1/support/me/read
 */
router.patch(
    "/me/read",
    supportController
        .markUserAsRead
        .bind(supportController),
);

export default router;