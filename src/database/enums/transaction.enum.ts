export enum TransactionType {
    DEPOSIT = "deposit",
    WITHDRAWAL = "withdrawal",
    HOLD = "hold",
    RELEASE = "release",
    PURCHASE = "purchase",
    COMMISSION = "commission",
    REFUND = "refund",
    BONUS = "bonus",
    TRANSFER = "transfer",
    ADJUSTMENT = "adjustment",

    // Daily task reward.
    ORDER_REWARD = "order_reward",
}

export enum TransactionStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
}