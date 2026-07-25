export class UpgradeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "UpgradeError";
    }
}

/**
 * Upgrade request does not exist.
 */
export class UpgradeRequestNotFoundError extends UpgradeError {

    constructor() {
        super("Upgrade request not found.");

        this.name = "UpgradeRequestNotFoundError";
    }
}

/**
 * User already has a pending upgrade request.
 */
export class DuplicatePendingUpgradeRequestError extends UpgradeError {

    constructor() {
        super(
            "You already have a pending upgrade request."
        );

        this.name = "DuplicatePendingUpgradeRequestError";
    }
}

/**
 * Membership plan does not exist.
 */
export class MembershipPlanNotFoundError extends UpgradeError {

    constructor() {
        super("Membership plan not found.");

        this.name = "MembershipPlanNotFoundError";
    }
}

/**
 * Payment method is invalid.
 */
export class InvalidPaymentMethodError extends UpgradeError {

    constructor() {
        super("Invalid payment method.");

        this.name = "InvalidPaymentMethodError";
    }
}

/**
 * Upgrade request status is invalid.
 */
export class InvalidUpgradeRequestStatusError extends UpgradeError {

    constructor() {
        super("Invalid upgrade request status.");

        this.name = "InvalidUpgradeRequestStatusError";
    }
}

/**
 * User already belongs to the highest membership plan.
 */
export class HighestMembershipPlanError extends UpgradeError {

    constructor() {
        super(
            "You are already on the highest membership plan."
        );

        this.name = "HighestMembershipPlanError";
    }
}

/**
 * Upgrade request has already been processed.
 */
export class UpgradeAlreadyProcessedError extends UpgradeError {

    constructor() {
        super(
            "This upgrade request has already been processed."
        );

        this.name = "UpgradeAlreadyProcessedError";
    }
}

/**
 * User attempted to access another user's upgrade request.
 */
export class UnauthorizedUpgradeRequestError extends UpgradeError {

    constructor() {
        super(
            "You are not authorized to access this upgrade request."
        );

        this.name = "UnauthorizedUpgradeRequestError";
    }
}