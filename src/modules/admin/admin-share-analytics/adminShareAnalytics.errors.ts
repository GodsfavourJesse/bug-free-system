export class AdminShareAnalyticsError
    extends Error {

    constructor(
        message: string,
    ) {
        super(message);

        this.name =
            "AdminShareAnalyticsError";
    }
}


/**
 * Share does not exist.
 */
export class AdminShareAnalyticsNotFoundError
    extends AdminShareAnalyticsError {

    constructor() {
        super(
            "Share not found.",
        );

        this.name =
            "AdminShareAnalyticsNotFoundError";
    }
}