import { db } from "@/database";
import { DbExecutor } from "@/database/types/types";

import {
    NotificationType,
} from "@/database/enums/notification.enum";

import {
    notificationRepository,
} from "./notification.repository";

import {
    notificationValidation,
} from "./notification.validation";

import {
    CreateNotificationDto,
} from "./notification.dto";

export class NotificationService {

    // Create a notification.
    async notify(
        executor: DbExecutor = db,
        dto: CreateNotificationDto,
    ) {

        notificationValidation.validateTitle(
            dto.title,
        );

        notificationValidation.validateMessage(
            dto.message,
        );

        return notificationRepository.create(
            executor,
            dto,
        );
    }

    // Send a notification to one user.
    async notifyUser(
        executor: DbExecutor = db,
        dto: CreateNotificationDto,
    ) {
        return this.notify(
            executor,
            dto,
        );
    }

    // Send the same notification to every admin.
    async notifyAdmins(
        executor: DbExecutor = db,
        data: Omit<
            CreateNotificationDto,
            "userId"
        >,
    ) {

        const admins =
            await notificationRepository.findAdmins(
                executor,
            );

        const notifications = [];

        for (const admin of admins) {

            const notification =
                await this.notify(
                    executor,
                    {
                        userId:
                            admin.id,

                        title:
                            data.title,

                        message:
                            data.message,

                        type:
                            data.type,

                        metadata:
                            data.metadata,
                    },
                );

            notifications.push(
                notification,
            );
        }

        return notifications;
    }

    // Get every notification for a user.
    async getNotifications(
        userId: string,
    ) {
        return notificationRepository.findByUser(
            db,
            userId,
        );
    }

    // Mark one notification as read.
    async markAsRead(
        id: string,
        executor: DbExecutor = db,
    ) {

        const notification =
            await notificationRepository.findById(
                executor,
                id,
            );

        notificationValidation.ensureNotificationExists(
            notification,
        );

        return notificationRepository.markAsRead(
            executor,
            id,
        );
    }

    // Mark every notification as read.
    async markAllAsRead(
        userId: string,
        executor: DbExecutor = db,
    ) {

        return notificationRepository.markAllAsRead(
            executor,
            userId,
        );
    }

    // Get unread notifications for a user.
    async getUnread(
        userId: string,
    ) {
        return notificationRepository.findUnread(
            db,
            userId,
        );
    }

    // Delete a notification.
    async delete(
        id: string,
        executor: DbExecutor = db,
    ) {

        const notification =
            await notificationRepository.findById(
                executor,
                id,
            );

        notificationValidation.ensureNotificationExists(
            notification,
        );

        await notificationRepository.delete(
            executor,
            id,
        );
    }

    // Delete every notification belonging to a user.
    async deleteAll(
        userId: string,
        executor: DbExecutor = db,
    ) {
        await notificationRepository.deleteAll(
            executor,
            userId,
        );
    }
}

export const notificationService =
    new NotificationService();