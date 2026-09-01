import {
    NextFunction,
    Request,
    Response,
} from "express";

import {
    notificationService,
} from "./notification.service";

export class NotificationController {

    /**
     * Get all notifications for
     * the authenticated user.
     */
    async getNotifications(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {

        try {

            const notifications =
                await notificationService
                    .getNotifications(
                        req.user!.id,
                    );

            return res.status(200).json({
                success: true,
                data: notifications,
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get unread notifications.
     */
    async getUnread(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {

        try {

            const notifications =
                await notificationService
                    .getUnread(
                        req.user!.id,
                    );

            return res.status(200).json({
                success: true,
                data: notifications,
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Mark one notification as read.
     */
    async markAsRead(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {

        try {

            const id =
                String(
                    req.params.id,
                );

            const notification =
                await notificationService
                    .markAsRead(
                        id,
                        req.user!.id,
                    );

            return res.status(200).json({
                success: true,
                message:
                    "Notification marked as read.",
                data: notification,
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Mark all notifications as read.
     */
    async markAllAsRead(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {

        try {

            await notificationService
                .markAllAsRead(
                    req.user!.id,
                );

            return res.status(200).json({
                success: true,
                message:
                    "All notifications marked as read.",
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete one notification.
     */
    async delete(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {

        try {

            const id =
                String(
                    req.params.id,
                );

            await notificationService
                .delete(
                    id,
                    req.user!.id,
                );

            return res.status(200).json({
                success: true,
                message:
                    "Notification deleted successfully.",
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete all notifications.
     */
    async deleteAll(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {

        try {

            await notificationService
                .deleteAll(
                    req.user!.id,
                );

            return res.status(200).json({
                success: true,
                message:
                    "All notifications deleted successfully.",
            });

        } catch (error) {
            next(error);
        }
    }
}

export const notificationController =
    new NotificationController();