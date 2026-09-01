import {
    Router,
} from "express";

import {
    adminSupportController,
} from "./adminSupport.controller";

import {
    authenticate,
} from "../../../middlewares/auth.middleware";

import {
    authorize,
} from "../../../middlewares/role.middleware";

import {
    USER_ROLES,
} from "../../../constants/roles";

const router = Router();

// ADMIN AUTHORIZATION

router.use(
    authenticate,
);

router.use(
    authorize(
        USER_ROLES.ADMIN,
    ),
);

// ADMIN SUPPORT

/**
 * Get all support conversations.
 *
 * GET /api/v1/admin/support/conversations
 */
router.get(
    "/conversations",
    adminSupportController
        .getAllConversations
        .bind(adminSupportController),
);

/**
 * Get one conversation.
 *
 * GET /api/v1/admin/support/conversations/:conversationId
 */
router.get(
    "/conversations/:conversationId",
    adminSupportController
        .getConversation
        .bind(adminSupportController),
);

/**
 * Get conversation messages.
 *
 * GET /api/v1/admin/support/conversations/:conversationId/messages
 */
router.get(
    "/conversations/:conversationId/messages",
    adminSupportController
        .getConversationMessages
        .bind(adminSupportController),
);

/**
 * Send admin message.
 *
 * POST /api/v1/admin/support/conversations/:conversationId/messages
 */
router.post(
    "/conversations/:conversationId/messages",
    adminSupportController
        .sendMessage
        .bind(adminSupportController),
);

/**
 * Mark conversation as read.
 *
 * PATCH /api/v1/admin/support/conversations/:conversationId/read
 */
router.patch(
    "/conversations/:conversationId/read",
    adminSupportController
        .markConversationAsRead
        .bind(adminSupportController),
);

/**
 * Close/reopen conversation.
 *
 * PATCH /api/v1/admin/support/conversations/:conversationId/status
 */
router.patch(
    "/conversations/:conversationId/status",
    adminSupportController
        .updateConversationStatus
        .bind(adminSupportController),
);

export default router;