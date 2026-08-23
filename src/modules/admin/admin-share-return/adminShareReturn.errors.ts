import { SharePurchaseError } from "../../sharePurchase/sharePurchase.errors";

/**
 * Share return is not yet eligible.
 */
export class ShareReturnNotExpiredError
    extends SharePurchaseError {

    constructor() {
        super(
            "This share purchase has not yet reached its return date.",
        );

        this.name =
            "ShareReturnNotExpiredError";
    }
}

/**
 * Admin wallet does not have enough
 * balance to fund the share return.
 */
export class ShareReturnInsufficientAdminBalanceError
    extends SharePurchaseError {

    constructor() {
        super(
            "Admin wallet has insufficient balance to credit this share return.",
        );

        this.name =
            "ShareReturnInsufficientAdminBalanceError";
    }
}

export class ShareReturnAlreadyCreditedError
    extends Error {

    constructor() {
        super(
            "The return for this share purchase has already been credited.",
        );

        this.name =
            "ShareReturnAlreadyCreditedError";
    }
}