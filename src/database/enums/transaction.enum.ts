export enum TransactionType {
    DEPOSIT = "deposit",
    DEPOSIT_DEBIT = "deposit_debit",
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

    ADMIN_DEPOSIT_DEBIT = "admin_deposit_debit",
}

export enum TransactionStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
}