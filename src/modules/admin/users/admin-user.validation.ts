import { UserNotFoundError } from "../user-profile/admin-user-profile.errors";
import {
    UserAlreadyActiveError,
    UserAlreadyInactiveError,
    UserAlreadyVerifiedError,
    UserNotVerifiedError,
} from "./admin-user.errors";

export class AdminUserValidation {

    // Ensure the user exists.
    ensureUserExists<T>(
        user: T | null | undefined,
    ): T {

        if (!user) {
            throw new UserNotFoundError();
        }

        return user;
    }

    // Ensure the user is active.
    ensureActive(
        user: {
            isActive: boolean;
        },
    ) {

        if (!user.isActive) {
            throw new UserAlreadyInactiveError();
        }

        return user;
    }

    // Ensure the user is inactive.
    ensureInactive(
        user: {
            isActive: boolean;
        },
    ) {

        if (user.isActive) {
            throw new UserAlreadyActiveError();
        }

        return user;
    }

    // Ensure the user is verified.
    ensureVerified(
        user: {
            isVerified: boolean;
        },
    ) {

        if (!user.isVerified) {
            throw new UserNotVerifiedError();
        }

        return user;
    }

    // Ensure the user has not already been verified.
    ensureNotVerified(
        user: {
            isVerified: boolean;
        },
    ) {

        if (user.isVerified) {
            throw new UserAlreadyVerifiedError();
        }

        return user;
    }

}

export const adminUserValidation =
    new AdminUserValidation();