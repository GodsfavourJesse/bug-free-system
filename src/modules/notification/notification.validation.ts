import {
    MAX_MESSAGE_LENGTH,
    MAX_TITLE_LENGTH,
} from "../../constants/notification.constants";

import {
    NotificationMessageRequiredError,
    NotificationMessageTooLongError,
    NotificationNotFoundError,
    NotificationTitleRequiredError,
    NotificationTitleTooLongError,
    NotificationUserIdRequiredError,
    NotificationTypeRequiredError,
    NotificationTypeInvalidError,
    NotificationMetadataInvalidError,
    NotificationRecipientNotFoundError,
    NotificationRecipientInactiveError,
} from "./notification.errors";

import {
    NotificationType,
} from "../../database/enums/notification.enum";

export class NotificationValidation {

    /**
     * Ensure notification exists.
     */
    ensureNotificationExists<T>(
        notification: T | null,
    ): T {

        if (!notification) {
            throw new NotificationNotFoundError();
        }

        return notification;
    }

    /**
     * Validate notification recipient ID.
     */
    validateUserId(
        userId: string,
    ): string {

        if (
            typeof userId !== "string" ||
            !userId.trim()
        ) {
            throw new NotificationUserIdRequiredError();
        }

        return userId.trim();
    }

    /**
     * Validate notification type.
     */
    validateType(
        type: unknown,
    ): NotificationType {
        
        if (
            type === undefined ||
            type === null ||
            type === ""
        ) {
            throw new NotificationTypeRequiredError();
        }

        const validTypes = Object.values(NotificationType);

        if (
            !validTypes.includes(
                type as NotificationType,
            )
        ) {
            throw new NotificationTypeInvalidError();
        }

        return type as NotificationType;
    }

    /**
     * Validate notification title.
     */
    validateTitle(
        title: string,
    ): string {

        if (
            typeof title !== "string" ||
            !title.trim()
        ) {
            throw new NotificationTitleRequiredError();
        }

        const trimmed =
            title.trim();

        if (
            trimmed.length >
            MAX_TITLE_LENGTH
        ) {
            throw new NotificationTitleTooLongError(
                MAX_TITLE_LENGTH,
            );
        }

        return trimmed;
    }

    /**
     * Validate notification message.
     */
    validateMessage(
        message: string,
    ): string {

        if (
            typeof message !== "string" ||
            !message.trim()
        ) {
            throw new NotificationMessageRequiredError();
        }

        const trimmed =
            message.trim();

        if (
            trimmed.length >
            MAX_MESSAGE_LENGTH
        ) {
            throw new NotificationMessageTooLongError(
                MAX_MESSAGE_LENGTH,
            );
        }

        return trimmed;
    }

    /**
     * Validate optional notification metadata.
     *
     * Metadata must be a plain object.
     *
     * Arrays, strings, numbers, booleans,
     * null and other primitive values are rejected.
     */
    validateMetadata(
        metadata?: Record<string, unknown>,
    ): Record<string, unknown> | undefined {

        if (metadata === undefined) {
            return undefined;
        }

        if (
            metadata === null ||
            typeof metadata !== "object" ||
            Array.isArray(metadata)
        ) {
            throw new NotificationMetadataInvalidError();
        }

        return metadata;
    }

    /**
     * Ensure recipient exists.
     */
    ensureRecipientExists<T>(
        user: T | null,
    ): T {

        if (!user) {
            throw new NotificationRecipientNotFoundError();
        }

        return user;
    }

    /**
     * Ensure recipient is active.
     */
    ensureRecipientIsActive(
        user: {
            isActive: boolean;
        },
    ) {

        if (!user.isActive) {
            throw new NotificationRecipientInactiveError();
        }

        return user;
    }
}

export const notificationValidation =
    new NotificationValidation();