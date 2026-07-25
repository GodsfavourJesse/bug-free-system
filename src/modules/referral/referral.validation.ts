import {
    ReferralNotFoundError,
    ReferrerNotFoundError,
} from "./referral.errors";

export class ReferralValidation {

    // Ensure a referral exists.
    ensureReferralExists<T>(
        referral: T | null,
    ): T {

        if (!referral) {
            throw new ReferralNotFoundError();
        }

        return referral;
    }

    // Ensure a referrer exists.
    ensureReferrerExists<T>(
        referrer: T | null,
    ): T {

        if (!referrer) {
            throw new ReferrerNotFoundError();
        }

        return referrer;
    }
}

export const referralValidation =
    new ReferralValidation();