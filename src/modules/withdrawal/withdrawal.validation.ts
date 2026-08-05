import { MINIMUM_WITHDRAWAL_AMOUNT } from "../../constants/withdrawal.constants";
import { WithdrawalStatus } from "../../database/enums/withdrawal.enum";
import {
    InvalidWithdrawalAmountError,
    InsufficientWalletBalanceError,
    WithdrawalAlreadyPaidError,
    WithdrawalAlreadyProcessedError,
    WithdrawalMustBeApprovedError,
    WithdrawalNotFoundError,
    MinimumWithdrawalAmountError,
    WithdrawalAlreadyApprovedError,
    WithdrawalAlreadyRejectedError,
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

    // Ensure the withdrawal is still pending.
    ensurePending(
        withdrawal: {
            status: WithdrawalStatus | string;
        },
    ) {
        switch (withdrawal.status) {
            case WithdrawalStatus.PENDING:
                return;

            case WithdrawalStatus.APPROVED:
                throw new WithdrawalAlreadyApprovedError();

            case WithdrawalStatus.REJECTED:
                throw new WithdrawalAlreadyRejectedError();

            case WithdrawalStatus.PAID:
                throw new WithdrawalAlreadyPaidError();

            default:
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
        if (!Number.isFinite(amount)) {
            throw new InvalidWithdrawalAmountError();
        }

        if (amount <= 0) {
            throw new InvalidWithdrawalAmountError();
        }
        return amount;
    }

    // Ensure minimum amount
    ensureMinimumAmount(
        amount: number,
    ) {
        if (amount < MINIMUM_WITHDRAWAL_AMOUNT) {
            throw new MinimumWithdrawalAmountError();
        }

        return amount;
    }

    // Ensure the withdrawal hasn't already been paid.
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