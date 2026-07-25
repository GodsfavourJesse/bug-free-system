export class ReferralError extends Error {

    constructor(message: string) {
        super(message);

        this.name = "ReferralError";
    }
}

export class ReferralNotFoundError extends ReferralError {

    constructor() {
        super("Referral not found.");

        this.name = "ReferralNotFoundError";
    }
}

export class ReferrerNotFoundError extends ReferralError {

    constructor() {
        super("Referrer not found.");

        this.name = "ReferrerNotFoundError";
    }
}