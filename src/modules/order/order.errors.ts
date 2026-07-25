export class UserNotEligibleForDailyOrdersError extends Error {
    constructor() {
        super("User is not eligible for daily orders.");
    }
}

export class MembershipNotEligibleForDailyOrdersError extends Error {
    constructor() {
        super("Membership is not eligible for daily orders.");
    }
}

export class DailyOrderNotFoundError extends Error {
    constructor() {
        super("Daily order not found.");
    }
}

export class DailyOrderItemNotFoundError extends Error {
    constructor() {
        super("Daily order item not found.");
    }
}

export class DailyOrderItemAlreadyCompletedError extends Error {
    constructor() {
        super("Daily order item has already been completed.");
    }
}

export class DailyOrderAlreadyCompletedError extends Error {
    constructor() {
        super("Daily order has already been completed or expired.");
    }
}