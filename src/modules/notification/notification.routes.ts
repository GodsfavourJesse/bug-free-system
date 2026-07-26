import { Router } from "express";


import { notificationController } from "./notification.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// All notification routes require authentication.
router.use(authenticate);

// Get all notifications.
router.get(
    "/",
    notificationController.getNotifications.bind(
        notificationController,
    ),
);

// Get unread notifications.
router.get(
    "/unread",
    notificationController.getUnread.bind(
        notificationController,
    ),
);

// Mark notification as read.
router.patch(
    "/:id/read",
    notificationController.markAsRead.bind(
        notificationController,
    ),
);

// Mark every notification as read.
router.patch(
    "/read-all",
    notificationController.markAllAsRead.bind(
        notificationController,
    ),
);

// Delete one notification.
router.delete(
    "/:id",
    notificationController.delete.bind(
        notificationController,
    ),
);

// Delete every notification.
router.delete(
    "/",
    notificationController.deleteAll.bind(
        notificationController,
    ),
);

export default router;