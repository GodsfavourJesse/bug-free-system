import { NotificationType } from "@/database/enums/notification.enum";

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
     * Notification title.
     */
    title: string;

    /**
     * Notification message.
     */
    message: string;

    /**
     * Additional data.
     *
     * Example:
     * - upgradeRequestId
     * - withdrawalId
     * - commissionId
     */
    metadata?: Record<string, unknown>;
}

/**
 * Update notification.
 */
export interface UpdateNotificationDto {

    /**
     * Mark notification as read.
     */
    isRead?: boolean;
}