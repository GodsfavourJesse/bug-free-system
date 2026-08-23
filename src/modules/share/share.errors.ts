export class ShareError extends Error {
    constructor(message: string) {
        super(message);

        this.name = "ShareError";
    }
}

/**
 * Share does not exist.
 */
export class ShareNotFoundError extends ShareError {
    constructor() {
        super("Share not found.");

        this.name = "ShareNotFoundError";
    }
}

/**
 * Share name is already being used.
 */
export class DuplicateShareNameError extends ShareError {
    constructor() {
        super("A share with this name already exists.");

        this.name = "DuplicateShareNameError";
    }
}

/**
 * Share name is invalid.
 */
export class InvalidShareNameError extends ShareError {
    constructor() {
        super(
            "Share name must be between 2 and 150 characters.",
        );

        this.name = "InvalidShareNameError";
    }
}

/**
 * Share description is too long.
 */
export class InvalidShareDescriptionError extends ShareError {
    constructor() {
        super(
            "Share description cannot exceed 5000 characters.",
        );

        this.name = "InvalidShareDescriptionError";
    }
}

/**
 * Share logo URL is invalid.
 */
export class InvalidShareLogoError extends ShareError {
    constructor() {
        super("Invalid share logo.");

        this.name = "InvalidShareLogoError";
    }
}

/**
 * Return percentage is invalid.
 */
export class InvalidSharePercentageError extends ShareError {
    constructor() {
        super(
            "Share return percentage must be greater than 0.",
        );

        this.name = "InvalidSharePercentageError";
    }
}

/**
 * Cycle is invalid.
 */
export class InvalidShareCycleError extends ShareError {
    constructor() {
        super(
            "Share cycle must be greater than 0 days.",
        );

        this.name = "InvalidShareCycleError";
    }
}

/**
 * Invalid share status.
 */
export class InvalidShareStatusError extends ShareError {
    constructor() {
        super("Invalid share status.");

        this.name = "InvalidShareStatusError";
    }
}

/**
 * Share cannot be modified in its current state.
 */
export class ShareModificationNotAllowedError
    extends ShareError {
    constructor() {
        super(
            "This share cannot be modified in its current status.",
        );

        this.name =
            "ShareModificationNotAllowedError";
    }
}

/**
 * Share cannot be closed.
 */
export class ShareAlreadyClosedError extends ShareError {
    constructor() {
        super("Share is already closed.");

        this.name = "ShareAlreadyClosedError";
    }
}

/**
 * Share cannot be started.
 */
export class ShareAlreadyStartedError extends ShareError {
    constructor() {
        super("Share has already started.");

        this.name = "ShareAlreadyStartedError";
    }
}

export class ShareHasPurchaseHistoryError
    extends Error {

    constructor() {
        super(
            "This share cannot be deleted because it has purchase history.",
        );

        this.name =
            "ShareHasPurchaseHistoryError";
    }
}

export class ShareAlreadyInProgressError extends Error {

    constructor() {
        super(
            "Share is already in progress.",
        );

        this.name =
            "ShareAlreadyInProgressError";
    }
}