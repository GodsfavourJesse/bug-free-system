import {
    db,
} from "../../database";

import {
    DbExecutor,
} from "../../database/types/types";

import {
    CreateNotificationDto,
} from "./notification.dto";

import {
    notificationRepository,
} from "./notification.repository";

import {
    notificationValidation,
} from "./notification.validation";

export class NotificationService {

    // Create a notification for one active recipient.
    async notify(
        executor: DbExecutor = db,
        dto: CreateNotificationDto,
    ) {
        const userId = notificationValidation.validateUserId(
            dto.userId,
        );

        const type = notificationValidation.validateType(
            dto.type,
        );

        const title = notificationValidation.validateTitle(
            dto.title,
        );

        const message = notificationValidation.validateMessage(
            dto.message,
        );

        const metadata = notificationValidation.validateMetadata(
            dto.metadata,
        );

        // Only active recipients can receive notifications.
        const recipient = await notificationRepository.findActiveUserById(
            executor,
            userId,
        );

        notificationValidation.ensureRecipientExists(
            recipient,
        );

        notificationValidation.ensureRecipientIsActive(
            recipient,
        );

        return notificationRepository.create(
            executor,
            {
                userId,
                type,
                title,
                message,
                metadata,
            },
        );
    }

    // Notify one user.
    async notifyUser(
        executor: DbExecutor = db,
        dto: CreateNotificationDto,
    ) {
        return this.notify(
            executor,
            dto,
        );
    }

    // Notify every active normal user.
    async notifyUsers(
        executor: DbExecutor = db,
        data: Omit<
            CreateNotificationDto,
            "userId"
        >,
    ) {

        const type =
            notificationValidation
                .validateType(
                    data.type,
                );

        const title =
            notificationValidation
                .validateTitle(
                    data.title,
                );

        const message =
            notificationValidation
                .validateMessage(
                    data.message,
                );

        const metadata =
            notificationValidation
                .validateMetadata(
                    data.metadata,
                );

        const users =
            await notificationRepository
                .findUsers(
                    executor,
                );

        const createdNotifications = [];

        for (
            const user of users
        ) {

            const notification =
                await this.notify(
                    executor,
                    {
                        userId:
                            user.id,

                        type,

                        title,

                        message,

                        metadata,
                    },
                );

            createdNotifications.push(
                notification,
            );
        }

        return createdNotifications;
    }

    // otify every active administrator.
    async notifyAdmins(
        executor: DbExecutor = db,
        data: Omit<
            CreateNotificationDto,
            "userId"
        >,
    ) {

        const type = notificationValidation.validateType(
            data.type,
        );

        const title = notificationValidation.validateTitle(
            data.title,
        );

        const message = notificationValidation.validateMessage(
            data.message,
        );

        const metadata = notificationValidation.validateMetadata(
            data.metadata,
        );

        const admins = await notificationRepository.findAdmins(
            executor,
        );

        const createdNotifications = [];

        for (
            const admin of admins
        ) {
            const notification = await this.notify(
                executor,
                {
                    userId: admin.id,
                    type,
                    title,
                    message,
                    metadata,
                },
            );

            createdNotifications.push(
                notification,
            );
        }

        return createdNotifications;
    }

    // Get all notifications for a user.
    async getNotifications(
        userId: string,
    ) {
        return notificationRepository.findByUser(
            db,
            userId,
        );
    }

    // Get unread notifications.
    async getUnread(
        userId: string,
    ) {
        return notificationRepository.findUnread(
            db,
            userId,
        );
    }

    // Mark one notification as read.
    // Ownership is verified.
    async markAsRead(
        id: string,
        userId: string,
        executor: DbExecutor = db,
    ) {
        const notification = await notificationRepository.findByIdForUser(
            executor,
            id,
             userId,
        );

        notificationValidation.ensureNotificationExists(
            notification,
        );

        return notificationRepository.markAsRead(
            executor,
            id,
            userId,
        );
    }

    // Mark all notifications as read.
    async markAllAsRead(
        userId: string,
        executor: DbExecutor = db,
    ) {
        return notificationRepository.markAllAsRead(
            executor,
            userId,
        );
    }

    /**
     * Delete one notification.
     *
     * Ownership is verified.
     */
    async delete(
        id: string,
        userId: string,
        executor: DbExecutor = db,
    ) {

        const notification =
            await notificationRepository.findByIdForUser(
                executor,
                id,
                userId,
            );

        notificationValidation.ensureNotificationExists(
            notification,
        );

        await notificationRepository.delete(
            executor,
            id,
            userId,
        );
    }

    /**
     * Delete all notifications for a user.
     */
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