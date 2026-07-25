export class UserAlreadyActiveError extends Error {

    constructor() {
        super("User is already active.");
        this.name = "UserAlreadyActiveError";
    }

}

export class UserAlreadyInactiveError extends Error {

    constructor() {
        super("User is already suspended.");
        this.name = "UserAlreadyInactiveError";
    }

}

export class UserAlreadyVerifiedError extends Error {

    constructor() {
        super("User is already verified.");
        this.name = "UserAlreadyVerifiedError";
    }

}

export class UserNotVerifiedError extends Error {

    constructor() {
        super("User is not verified.");
        this.name = "UserNotVerifiedError";
    }

}