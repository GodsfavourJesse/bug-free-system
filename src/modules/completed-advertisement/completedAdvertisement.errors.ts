/**
 * Base error for all completed advertisement errors.
 */
export class CompletedAdvertisementError extends Error {

    constructor(message: string) {
        super(message);

        this.name =
            "CompletedAdvertisementError";
    }
}

/**
 * Thrown when a user tries to complete
 * an advertisement that has already
 * been completed.
 */
export class AlreadyCompletedAdvertisementError
    extends CompletedAdvertisementError {

    constructor(message: string) {
        super(message);

        this.name =
            "AlreadyCompletedAdvertisementError";
    }
}

/**
 * Thrown when a completed advertisement
 * record cannot be found.
 */
export class CompletedAdvertisementNotFoundError
    extends CompletedAdvertisementError {

    constructor(message: string) {
        super(message);

        this.name =
            "CompletedAdvertisementNotFoundError";
    }
}