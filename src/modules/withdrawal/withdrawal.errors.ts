// Thrown when a withdrawal request
// cannot be found.
export class WithdrawalNotFoundError
    extends Error {

    constructor() {
        super(
            "Withdrawal request not found.",
        );

        this.name = "WithdrawalNotFoundError";
    }
}

// Thrown when an operation is attempted
// on a withdrawal that has already been
// processed.
export class WithdrawalAlreadyProcessedError
    extends Error {

    constructor() {
        super(
            "Withdrawal request has already been processed.",
        );

        this.name = "WithdrawalAlreadyProcessedError";
    }
}

// Thrown when a withdrawal must first
// be approved before the requested
// operation can continue.
export class WithdrawalMustBeApprovedError
    extends Error {

    constructor() {
        super(
            "Withdrawal request must be approved first.",
        );

        this.name = "WithdrawalMustBeApprovedError";
    }
}

// Thrown when the wallet does not have
// enough available balance.
export class InsufficientWalletBalanceError
    extends Error {

    constructor() {
        super(
            "Insufficient wallet balance.",
        );

        this.name = "InsufficientWalletBalanceError";
    }
}

// Thrown when the withdrawal amount
// is invalid.
export class InvalidWithdrawalAmountError
    extends Error {

    constructor() {
        super(
            "Invalid withdrawal amount.",
        );

        this.name = "InvalidWithdrawalAmountError";
    }
}

// Thrown when attempting to mark an
// already-paid withdrawal as paid again.
export class WithdrawalAlreadyPaidError
    extends Error {

    constructor() {
        super(
            "Withdrawal has already been paid.",
        );

        this.name = "WithdrawalAlreadyPaidError";
    }
}

// Withdrawal amount is below the platform minimum.
export class MinimumWithdrawalAmountError extends Error {
    constructor() {
        super(
            "Minimum withdrawal amount is ₦3,000.",
        );

        this.name = "MinimumWithdrawalAmountError";
    }
}

// Withdrawal has already been rejected.
export class WithdrawalAlreadyRejectedError extends Error {
    constructor() {
        super(
            "Withdrawal request has already been rejected.",
        );

        this.name = "WithdrawalAlreadyRejectedError";
    }
}

// Withdrawal has already been approved.
export class WithdrawalAlreadyApprovedError extends Error {
    constructor() {
        super(
            "Withdrawal request has already been approved.",
        );

        this.name = "WithdrawalAlreadyApprovedError";
    }
}