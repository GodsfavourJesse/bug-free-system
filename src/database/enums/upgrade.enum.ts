export enum UpgradeRequestStatus {
    PENDING = "pending",
    UNDER_REVIEW = "under_review",
    APPROVED = "approved",
    REJECTED = "rejected",
    CANCELLED = "cancelled",
}

export enum PaymentMethod {
    BANK_TRANSFER = "bank_transfer",
    CARD = "card",
    WALLET = "wallet",
    CRYPTO = "crypto",
    ADMIN = "admin",
}