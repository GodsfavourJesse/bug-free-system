// modules/reward-engine/rewardEngine.errors.ts

/**
 * Reward amount must be greater than zero.
 */
export class InvalidRewardAmountError extends Error {
    constructor() {
        super("Reward amount must be greater than zero.");

        this.name = "InvalidRewardAmountError";
    }
}

/**
 * User wallet could not be found.
 */
export class RewardWalletNotFoundError extends Error {
    constructor() {
        super("Reward wallet not found.");

        this.name = "RewardWalletNotFoundError";
    }
}

/**
 * Wallet is not eligible to receive rewards.
 */
export class RewardWalletInactiveError extends Error {
    constructor() {
        super("Reward wallet is inactive.");

        this.name = "RewardWalletInactiveError";
    }
}

/**
 * Reward transaction type is invalid.
 */
export class InvalidRewardTransactionTypeError extends Error {
    constructor() {
        super("Invalid reward transaction type.");

        this.name = "InvalidRewardTransactionTypeError";
    }
}

/**
 * Failed to process the reward.
 */
export class RewardProcessingError extends Error {
    constructor() {
        super("Failed to process reward.");

        this.name = "RewardProcessingError";
    }
}

/**
 * User has reached today's reward limit.
 */
export class DailyLimitReachedError extends Error {
    constructor() {
        super(
            "Daily reward limit has been reached.",
        );

        this.name =
            "DailyLimitReachedError";
    }
}