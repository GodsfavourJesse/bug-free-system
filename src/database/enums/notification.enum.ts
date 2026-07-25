// Notification categories.
// Represents the business event that
// generated the notification.
export enum NotificationType {

    // Membership upgrade notifications.
    UPGRADE = "upgrade",

    // Withdrawal notifications.
    WITHDRAWAL = "withdrawal",

    // Commission notifications.
    COMMISSION = "commission",

    // Wallet activity.
    WALLET = "wallet",

    // Referral activity.
    REFERRAL = "referral",

    // Advertisements.
    ADVERTISEMENT = "advertisement",

    // Account verification.
    VERIFICATION = "verification",

    // Daily task reward.
    ORDER_REWARD = "order_reward",

    // Security events.
    
    // Login alerts,
    // password changes,
    // suspicious activity, etc.
    SECURITY = "security",

    // General system notifications.
    SYSTEM = "system",
}