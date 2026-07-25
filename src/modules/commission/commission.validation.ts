import { MAX_COMMISSION_LEVEL } from "@/constants/commision.constants";
import {
    CommissionError,
    IneligibleCommissionRecipientError,
    InvalidCommissionAmountError,
    InvalidCommissionLevelError,
} from "./commission.errors";

export class CommissionValidation {

    // Ensure commission amount is valid.
    validateCommissionAmount(
        amount: number,
    ) {

        if (
            Number.isNaN(amount) ||
            amount <= 0
        ) {
            throw new InvalidCommissionAmountError();
        }

        return amount;
    }

    // Ensure referral level is valid.
    ensureEligibleLevel(
        level: number,
    ) {

        if (
            level < 1 ||
            level >
                MAX_COMMISSION_LEVEL
        ) {
            throw new InvalidCommissionLevelError();
        }

        return level;
    }

    // Ensure recipient can receive commission.
    //
    // Pass the user object returned by the repository.
    ensureEligibleUser<
        T extends {
            isActive: boolean;
        } | null,
    >(
        user: T,
    ): NonNullable<T> {

        if (
            !user ||
            !user.isActive
        ) {
            throw new IneligibleCommissionRecipientError();
        }

        return user as NonNullable<T>;
    }

    // Ensure buyer is not rewarded.
    ensureNotSelfCommission(
        buyerId: string,
        recipientId: string,
    ) {

        if (buyerId === recipientId) {
            throw new CommissionError(
                "Users cannot earn commission from their own purchases.",
            );
        }
    }
}

export const commissionValidation =
    new CommissionValidation();