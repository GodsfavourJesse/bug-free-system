import {
    InsufficientBalanceError,
    InsufficientHeldBalanceError,
    InvalidWalletAmountError,
    WalletNotFoundError,
} from "./wallet.errors";

export class WalletValidation {

    // Ensures a monetary amount is valid.
    validateAmount(
        amount: number,
    ): number {

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            throw new InvalidWalletAmountError();
        }

        return amount;
    }

    // Ensures a wallet exists.
    ensureWalletExists<T>(
        wallet: T | null,
    ): T {

        if (!wallet) {
            throw new WalletNotFoundError();
        }

        return wallet;
    }

    // Ensures the available balance
    // is sufficient.
    ensureAvailableBalance(
        balance: number,
        amount: number,
    ) {

        if (balance < amount) {
            throw new InsufficientBalanceError();
        }
    }

    // Ensures the held balance
    // is sufficient.
    ensureHeldBalance(
        balance: number,
        amount: number,
    ) {

        if (balance < amount) {
            throw new InsufficientHeldBalanceError();
        }
    }

    // Formats a monetary value.
    toDecimal(
        value: number,
    ): string {

        return value.toFixed(2);
    }
}

export const walletValidation =
    new WalletValidation();