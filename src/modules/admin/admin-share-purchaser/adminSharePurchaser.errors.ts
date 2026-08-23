export class AdminSharePurchaserError
    extends Error {

    constructor(
        message: string,
    ) {
        super(message);

        this.name =
            "AdminSharePurchaserError";
    }
}


/**
 * Share does not exist.
 */
export class AdminSharePurchaserShareNotFoundError
    extends AdminSharePurchaserError {

    constructor() {
        super(
            "Share not found.",
        );

        this.name =
            "AdminSharePurchaserShareNotFoundError";
    }
}


/**
 * Purchase does not exist.
 */
export class AdminSharePurchaserNotFoundError
    extends AdminSharePurchaserError {

    constructor() {
        super(
            "Share purchase not found.",
        );

        this.name =
            "AdminSharePurchaserNotFoundError";
    }
}