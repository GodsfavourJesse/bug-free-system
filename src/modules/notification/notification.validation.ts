import { MAX_MESSAGE_LENGTH, MAX_TITLE_LENGTH } from "@/constants/notification.constants";
import {
    NotificationMessageTooLongError,
    NotificationTitleTooLongError,
    NotificationNotFoundError,
} from "./notification.errors";

export class NotificationValidation {

    // Ensure notification exists.
    ensureNotificationExists<T>(
        notification: T | null,
    ): T {

        if (!notification) {
            throw new NotificationNotFoundError();
        }

        return notification;
    }

    // Validate title.
    validateTitle(
        title: string,
    ) {

        if (!title.trim()) {
            throw new NotificationTitleTooLongError(
                "Notification title is required.",
            );
        }

        if (
            title.length >
            MAX_TITLE_LENGTH
        ) {
            throw new NotificationTitleTooLongError(
                `Notification title cannot exceed ${MAX_TITLE_LENGTH} characters.`,
            );
        }

        return title.trim();
    }

    // Validate message.
    validateMessage(
        message: string,
    ) {

        if (!message.trim()) {
            throw new NotificationMessageTooLongError(
                "Notification message is required.",
            );
        }

        if (
        message.length >
        MAX_MESSAGE_LENGTH
    ) {
        throw new NotificationMessageTooLongError(
            `Notification message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`,
        );
    }

            return message.trim();
        }
    }

export const notificationValidation =
    new NotificationValidation();