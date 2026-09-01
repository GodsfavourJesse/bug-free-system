import {
    NotificationType,
} from "../../database/enums/notification.enum";

/**
 * Create notification.
 */
export interface CreateNotificationDto {

    /**
     * Recipient.
     */
    userId: string;

    /**
     * Notification category.
     */
    type: NotificationType;

    /**
     * Short notification title.
     */
    title: string;

    /**
     * Notification message.
     */
    message: string;

    /**
     * Optional business-event metadata.
     */
    metadata?: Record<string, unknown>;
}

/**
 * Update notification.
 *
 * Currently used conceptually for
 * read state. The API uses dedicated
 * read endpoints instead.
 */
export interface UpdateNotificationDto {
    isRead?: boolean;
}