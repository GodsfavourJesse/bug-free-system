import {
    Router,
} from "express";

import {
    notificationController,
} from "./notification.controller";

import {
    authenticate,
} from "../../middlewares/auth.middleware";

const router =
    Router();

/**
 * All notification routes require
 * an authenticated user.
 */
router.use(authenticate);

/**
 * Get all notifications.
 *
 * GET /api/v1/notifications
 */
router.get(
    "/",
    notificationController
        .getNotifications
        .bind(
            notificationController,
        ),
);

/**
 * Get unread notifications.
 *
 * GET /api/v1/notifications/unread
 */
router.get(
    "/unread",
    notificationController
        .getUnread
        .bind(
            notificationController,
        ),
);

/**
 * Mark one notification as read.
 *
 * PATCH /api/v1/notifications/:id/read
 */
router.patch(
    "/:id/read",
    notificationController
        .markAsRead
        .bind(
            notificationController,
        ),
);

/**
 * Mark all notifications as read.
 *
 * PATCH /api/v1/notifications/read-all
 */
router.patch(
    "/read-all",
    notificationController
        .markAllAsRead
        .bind(
            notificationController,
        ),
);

/**
 * Delete one notification.
 *
 * DELETE /api/v1/notifications/:id
 */
router.delete(
    "/:id",
    notificationController
        .delete
        .bind(
            notificationController,
        ),
);

/**
 * Delete all notifications.
 *
 * DELETE /api/v1/notifications
 */
router.delete(
    "/",
    notificationController
        .deleteAll
        .bind(
            notificationController,
        ),
);

export default router;