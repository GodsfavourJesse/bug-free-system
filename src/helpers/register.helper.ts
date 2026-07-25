import { authRepository } from "@/modules/auth/auth.repository";

/**
 * Resolve the user who owns the referral code.
 *
 * Returns:
 * - null    -> No referral supplied
 * - userId  -> Referring user's id
 */
export async function resolveReferral(
    referral?: string
): Promise<string | null> {

    // Registration without a referral code
    if (!referral) {
        return null;
    }

    const inviter =
        await authRepository.findUserByReferralCode(
            referral
        );

    if (!inviter) {
        throw new Error(
            "Invalid referral code."
        );
    }

    return inviter.id;
}