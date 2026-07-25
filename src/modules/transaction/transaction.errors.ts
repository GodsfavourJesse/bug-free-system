export class TransactionError extends Error {

    constructor(message: string) {
        super(message);

        this.name = "TransactionError";
    }
}

/**
 * Transaction does not exist.
 */
export class TransactionNotFoundError extends TransactionError {

    constructor() {
        super("Transaction not found.");

        this.name = "TransactionNotFoundError";
    }
}

/**
 * Transaction type is invalid.
 */
export class InvalidTransactionTypeError extends TransactionError {

    constructor() {
        super("Invalid transaction type.");

        this.name = "InvalidTransactionTypeError";
    }
}

/**
 * Transaction status is invalid.
 */
export class InvalidTransactionStatusError extends TransactionError {

    constructor() {
        super("Invalid transaction status.");

        this.name = "InvalidTransactionStatusError";
    }
}

/**
 * Transaction reference already exists.
 */
export class DuplicateTransactionReferenceError extends TransactionError {

    constructor() {
        super("Transaction reference already exists.");

        this.name = "DuplicateTransactionReferenceError";
    }
}