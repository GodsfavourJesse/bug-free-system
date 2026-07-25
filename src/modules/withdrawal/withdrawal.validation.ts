import {
    WithdrawalStatus,
} from "@/database/enums/withdrawal.enum";

import {
    InvalidWithdrawalAmountError,
    InsufficientWalletBalanceError,
    WithdrawalAlreadyPaidError,
    WithdrawalAlreadyProcessedError,
    WithdrawalMustBeApprovedError,
    WithdrawalNotFoundError,
} from "./withdrawal.errors";

export class WithdrawalValidation {

    // Ensure the withdrawal exists.
    ensureWithdrawalExists<
        T,
    >(withdrawal: T | null) {
        if (!withdrawal) {
            throw new WithdrawalNotFoundError();
        }

        return withdrawal;
    }

    // Ensure the withdrawal
    // is still pending.
    ensurePending(
        withdrawal: {
            status:
                WithdrawalStatus | string;
        },
    ) {
        if (
            withdrawal.status !==
            WithdrawalStatus.PENDING
        ) {
            throw new WithdrawalAlreadyProcessedError();
        }
    }

    // Ensure the withdrawal
    // has already been approved.
    ensureApproved(
        withdrawal: {
            status:
                WithdrawalStatus | string;
        },
    ) {
        if (
            withdrawal.status !==
            WithdrawalStatus.APPROVED
        ) {
            throw new WithdrawalMustBeApprovedError();
        }
    }

    // Ensure enough balance exists.
    ensureSufficientBalance(
        availableBalance: number,
        amount: number,
    ) {
        if (
            availableBalance <
            amount
        ) {
            throw new InsufficientWalletBalanceError();
        }
    }

    // Ensure amount is valid.
    ensureValidAmount(
        amount: number,
    ) {
        if (
            Number.isNaN(amount) ||
            amount <= 0
        ) {
            throw new InvalidWithdrawalAmountError();
        }

        return amount;
    }

    // Ensure the withdrawal
    // hasn't already been paid.
    ensureNotAlreadyPaid(
        withdrawal: {
            status:
                WithdrawalStatus | string;
        },
    ) {
        if (
            withdrawal.status ===
            WithdrawalStatus.PAID
        ) {
            throw new WithdrawalAlreadyPaidError();
        }
    }
}

export const withdrawalValidation =
    new WithdrawalValidation();