
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

    // Lock admin wallet row.
    // Prevent concurrent financial updates.
    async lockWallet(
        executor: DbExecutor,
    ) {
        const wallet = await adminWalletRepository.lockWallet(
            executor,
        );

        if (!wallet) {
            throw new AdminWalletNotFoundError();
        }

        return wallet;
    }

    // Get admin wallet without locking.
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

    // Ensure admin has enough balance.
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

    // Debit admin wallet safely.
    async debit(
        executor: DbExecutor,
        amount: number,
    ) {

        const { wallet } = await this.getWallet(
            executor,
        );

        const available =
            Number(
                wallet.availableBalance,
            );

        if (available < amount) {
            throw new InsufficientAdminBalanceError();
        }

        const newBalance =
            available - amount;

        await adminWalletRepository.updateAvailableBalance(
            executor,
            wallet.id,
            newBalance.toFixed(2),
        );

        return {
            walletId: wallet.id,

            userId: wallet.userId,

            balanceBefore: available,

            balanceAfter: newBalance,
        };
    }
}

export const adminWalletService =
    new AdminWalletService();