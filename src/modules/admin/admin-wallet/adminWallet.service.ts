import { db } from "../../../database";
import { DbExecutor } from "../../../database/types/types";
import { adminWalletRepository } from "./adminWallet.repository";

export class AdminWalletNotFoundError extends Error {
    constructor() {
        super("Admin wallet not found.");
    }
}

export class InsufficientAdminBalanceError extends Error {
    constructor() {
        super("Admin wallet has insufficient balance.");
    }
}

export class AdminWalletService {

    // Lock the admin wallet row.
    // Used before any balance update.
    async lockWallet(
        executor: DbExecutor,
    ) {
        const wallet =
            await adminWalletRepository.lockWallet(
                executor,
            );

        if (!wallet) {
            throw new AdminWalletNotFoundError();
        }

        return wallet;
    }

    // Get the admin wallet.
    // No row locking.
    async getWallet(
        executor: DbExecutor = db,
    ) {
        const wallet =
            await adminWalletRepository.findWallet(
                executor,
            );

        if (!wallet) {
            throw new AdminWalletNotFoundError();
        }

        return wallet;
    }

    // Ensure the admin wallet has enough balance.
    async ensureSufficientBalance(
    executor: DbExecutor,
        amount: number,
    ) {
        const { wallet } =
            await this.getWallet(
                executor,
            );

        const available =
            Number(
                wallet.availableBalance,
            );

        if (available < amount) {
            throw new InsufficientAdminBalanceError();
        }

        return wallet;
    }

    // Debit the admin wallet.
    async debit(
        executor: DbExecutor,
        amount: number,
    ) {
        const { wallet } =
            await this.lockWallet(
                executor,
            );

        const balanceBefore =
            Number(
                wallet.availableBalance,
            );

        if (balanceBefore < amount) {
            throw new InsufficientAdminBalanceError();
        }

        const balanceAfter =
            balanceBefore - amount;

        await adminWalletRepository.updateAvailableBalance(
            executor,
            wallet.id,
            balanceAfter.toFixed(2),
        );

        return {
            walletId: wallet.id,
            userId: wallet.userId,
            balanceBefore,
            balanceAfter,
        };
    }

    // Debit an already-locked admin wallet.
    //
    // IMPORTANT:
    // The wallet must already have been locked
    // with lockWallet() in the same transaction.
    //
    // This method does NOT:
    // - lock the wallet
    // - check the balance
    // - create a transaction
    // - credit the user
    async debitLockedWallet(
        executor: DbExecutor,
        walletId: string,
        balanceAfter: string,
    ) {
        return adminWalletRepository.updateAvailableBalance(
            executor,
            walletId,
            balanceAfter,
        );
    }

    // Credit the admin wallet.
    async credit(
        executor: DbExecutor,
        amount: number,
    ) {
        const { wallet } =
            await this.lockWallet(
                executor,
            );

        const balanceBefore =
            Number(
                wallet.availableBalance,
            );

        const balanceAfter =
            balanceBefore + amount;

        await adminWalletRepository.updateAvailableBalance(
            executor,
            wallet.id,
            balanceAfter.toFixed(2),
        );

        return {
            walletId: wallet.id,
            userId: wallet.userId,
            balanceBefore,
            balanceAfter,
        };
    }
}

export const adminWalletService =
    new AdminWalletService();