/**
 * Deposit request was not found.
 */
export class DepositNotFoundError extends Error {
    statusCode = 404;

    constructor() {
        super("Deposit request not found.");
        this.name = "DepositNotFoundError";
    }
}

/**
 * User already has a pending deposit request.
 */
export class DuplicatePendingDepositError extends Error {
    statusCode = 409;

    constructor() {
        super("You already have a pending deposit request.");
        this.name = "DuplicatePendingDepositError";
    }
}

/**
 * Deposit does not belong to the authenticated user.
 */
export class UnauthorizedDepositError extends Error {
    statusCode = 403;

    constructor() {
        super("You are not authorized to access this deposit request.");
        this.name = "UnauthorizedDepositError";
    }
}

/**
 * Deposit is not in a valid status
 * for this operation.
 */
export class InvalidDepositStatusError extends Error {
    statusCode = 400;

    constructor() {
        super("Invalid deposit request status.");
        this.name = "InvalidDepositStatusError";
    }
}
