export class CommissionError extends Error {

    constructor(message: string) {
        super(message);

        this.name = "CommissionError";
    }
}

export class InvalidCommissionAmountError extends CommissionError {

    constructor() {
        super("Commission amount must be greater than zero.");

        this.name =
            "InvalidCommissionAmountError";
    }
}

export class InvalidCommissionLevelError extends CommissionError {

    constructor() {
        super("Invalid commission level.");

        this.name =
            "InvalidCommissionLevelError";
    }
}

export class IneligibleCommissionRecipientError extends CommissionError {

    constructor() {
        super(
            "User is not eligible to receive commission.",
        );

        this.name =
            "IneligibleCommissionRecipientError";
    }
}