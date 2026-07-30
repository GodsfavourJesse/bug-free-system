import {
    InvalidRewardAmountError,
    RewardWalletNotFoundError,
    InvalidRewardTransactionTypeError,
    DailyLimitReachedError,
} from "./rewardEngine.errors";

export class RewardEngineValidation {

    /**
     * Ensure a valid user ID
     * has been supplied.
     */
    ensureUserId(
        userId: string,
    ) {
        if (
            !userId ||
            userId.trim().length === 0
        ) {
            throw new Error(
                "User ID is required.",
            );
        }

        return userId;
    }

    /**
     * Ensure the reward amount
     * is greater than zero.
     */
    ensurePositiveAmount(
        amount: number,
    ) {
        if (
            Number.isNaN(amount) ||
            amount <= 0
        ) {
            throw new InvalidRewardAmountError();
        }

        return amount;
    }

    /**
     * Ensure the wallet exists.
     */
    ensureWalletExists<
        T extends {
            id: string;
        },
    >(
        wallet: T | null,
    ): T {

        if (!wallet) {
            throw new RewardWalletNotFoundError();
        }

        return wallet;
    }

    /**
     * Ensure a transaction type
     * has been supplied.
     */
    ensureValidTransactionType(
        transactionType: string,
    ) {
        if (
            !transactionType ||
            transactionType.trim().length === 0
        ) {
            throw new InvalidRewardTransactionTypeError();
        }

        return transactionType;
    }

    ensureDailyLimitNotReached(
        completed: number,
        limit: number,
    ) {
        if (completed >= limit) {
            throw new DailyLimitReachedError();
        }
    }
}

export const rewardEngineValidation =
    new RewardEngineValidation();