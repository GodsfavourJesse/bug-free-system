import { Request, Response } from "express";

import { notificationService } from "./notification.service";

export class NotificationController {

    // Get all notifications for the authenticated user.
    async getNotifications(
        req: Request,
        res: Response,
    ) {

        const notifications =
            await notificationService.getNotifications(
                req.user!.id,
            );

        return res.json({
            success: true,
            data: notifications,
        });
    }

    // Get only unread notifications.
    async getUnread(
        req: Request,
        res: Response,
    ) {

        const notifications =
            await notificationService.getUnread(
                req.user!.id,
            );

        return res.json({
            success: true,
            data: notifications,
        });
    }

    // Mark a notification as read.
    async markAsRead(
        req: Request,
        res: Response,
    ) {

        const id = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;

        const notification =
            await notificationService.markAsRead(
                id,
                req.user!.id,
            );

        return res.json({
            success: true,
            message:
                "Notification marked as read.",
            data: notification,
        });
    }

    // Mark every notification as read.
    async markAllAsRead(
        req: Request,
        res: Response,
    ) {

        await notificationService.markAllAsRead(
            req.user!.id,
        );

        return res.json({
            success: true,
            message:
                "All notifications marked as read.",
        });
    }

    // Delete a notification.
    async delete(
        req: Request,
        res: Response,
    ) {

        const id = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;

        await notificationService.delete(
            id,
            req.user!.id,
        );

        return res.json({
            success: true,
            message:
                "Notification deleted successfully.",
        });
    }

    // Delete every notification.
    async deleteAll(
        req: Request,
        res: Response,
    ) {

        await notificationService.deleteAll(
            req.user!.id,
        );

        return res.json({
            success: true,
            message:
                "All notifications deleted successfully.",
        });
    }
}

export const notificationController =
    new NotificationController();