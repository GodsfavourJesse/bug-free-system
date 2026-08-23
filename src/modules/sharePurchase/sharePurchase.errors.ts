export class SharePurchaseError extends Error {
    constructor(message: string) {
        super(message);

        this.name = "SharePurchaseError";
    }
}

/**
 * Share does not exist.
 */
export class ShareNotFoundError extends SharePurchaseError {
    constructor() {
        super("Share not found.");

        this.name = "ShareNotFoundError";
    }
}

/**
 * Share cannot currently be purchased.
 */
export class ShareNotAvailableError extends SharePurchaseError {
    constructor() {
        super(
            "This share is not currently available for purchase.",
        );

        this.name = "ShareNotAvailableError";
    }
}

/**
 * Purchase amount is invalid.
 */
export class InvalidSharePurchaseAmountError
    extends SharePurchaseError {

    constructor() {
        super(
            "Purchase amount must be greater than zero.",
        );

        this.name =
            "InvalidSharePurchaseAmountError";
    }
}

/**
 * User wallet does not have enough money.
 */
export class SharePurchaseInsufficientBalanceError
    extends SharePurchaseError {

    constructor() {
        super(
            "Insufficient balance to purchase this share.",
        );

        this.name =
            "SharePurchaseInsufficientBalanceError";
    }
}

/**
 * Purchase does not exist.
 */
export class SharePurchaseNotFoundError
    extends SharePurchaseError {

    constructor() {
        super("Share purchase not found.");

        this.name =
            "SharePurchaseNotFoundError";
    }
}

/**
 * Purchase has already been completed.
 */
export class SharePurchaseAlreadyProcessedError
    extends SharePurchaseError {

    constructor() {
        super(
            "This share purchase has already been processed.",
        );

        this.name =
            "SharePurchaseAlreadyProcessedError";
    }
}

/**
 * Purchase cannot be completed because
 * the share cycle has already ended.
 */
export class ShareCycleExpiredError
    extends SharePurchaseError {

    constructor() {
        super(
            "The share cycle has already expired.",
        );

        this.name =
            "ShareCycleExpiredError";
    }
}

/**
 * Admin wallet could not be found.
 */
export class ShareAdminWalletNotFoundError
    extends SharePurchaseError {

    constructor() {
        super(
            "Admin wallet not found.",
        );

        this.name =
            "ShareAdminWalletNotFoundError";
    }
}
