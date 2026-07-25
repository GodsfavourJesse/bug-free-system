// Thrown when a user
// cannot be found.
export class UserNotFoundError
    extends Error {

    constructor() {

        super(
            "User not found.",
        );

        this.name =
            "UserNotFoundError";
    }

}

// Thrown when attempting
// to create a user that
// already exists.
export class UserAlreadyExistsError
    extends Error {

    constructor() {

        super(
            "User already exists.",
        );

        this.name =
            "UserAlreadyExistsError";
    }

}

// Thrown when a user's
// account is inactive.
export class UserInactiveError
    extends Error {

    constructor() {

        super(
            "User account is inactive.",
        );

        this.name =
            "UserInactiveError";
    }

}

// Thrown when a user's
// account has not yet
// been verified.
export class UserNotVerifiedError
    extends Error {

    constructor() {

        super(
            "User account is not verified.",
        );

        this.name =
            "UserNotVerifiedError";
    }

}