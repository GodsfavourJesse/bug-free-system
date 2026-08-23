import { walletRepository } from "./wallet.repository";
import { WalletAlreadyExistsError } from "./wallet.errors";
import { walletValidation } from "./wallet.validation";
import { withTransaction } from "../../database/transaction/transaction";
import { DbExecutor } from "../../database/types/types";
import { db } from "../../database";

export class WalletService {

    // Create a wallet for a new user.
    // A user can only own one wallet.
    async createWallet(
        userId: string,
    ) {
        return withTransaction(
            async (tx) => {
                const existingWallet = await walletRepository.findByUserId(
                    tx,
                    userId,
                );

                if (existingWallet) {
                    throw new WalletAlreadyExistsError();
                }

                return walletRepository.create(
                    tx,
                    userId,
                );

            },
        );
    }

    // Find wallet by ID.
    async findById(
        executor: DbExecutor = db,
        walletId: string,
    ) {
        const wallet =
            await walletRepository.findById(
                executor,
                walletId,
            );

        return walletValidation.ensureWalletExists(
            wallet,
        );
    }

    // Return a user's wallet.
    async findByUserId(
        executor: DbExecutor = db,
        userId: string,
    ) {
        const wallet =
            await walletRepository.findByUserId(
                executor,
                userId,
            );

        return walletValidation.ensureWalletExists(
            wallet,
        );
    }

    // Retrieves a user's wallet.
    // Throws if the wallet does not exist.
    async getWallet(
        userId: string,
    ) {
        return this.findByUserId(
            db,
            userId,
        );
    }

    // Returns the current wallet balances.
    // Without exposing the full wallet.
    async getBalance(
        userId: string,
    ) {
        const wallet = await this.getWallet(
            userId,
        );

        return {
            availableBalance: wallet.availableBalance,
            heldBalance: wallet.heldBalance,
            totalEarned: wallet.totalEarned,
            totalDeposited: wallet.totalDeposited,
            totalWithdrawn: wallet.totalWithdrawn,
        };
    }

    // Lock wallet.
    async lockByUserId(
        executor: DbExecutor,
        userId: string,
    ) {
        const wallet =
            await walletRepository.lockByUserId(
                executor,
                userId,
            );

        return walletValidation.ensureWalletExists(
            wallet,
        );
    }

    // Credit only available balance.
    async creditBalance(
        executor: DbExecutor,
        userId: string,
        amount: number,
    ) {
        const wallet =
            await this.lockByUserId(
                executor,
                userId,
            );

        const before =
            Number(wallet.availableBalance);

        const after =
            before + amount;

        return walletRepository.updateBalances(
            executor,
            wallet.id,
            {
                availableBalance:
                    after.toFixed(2),
            },
        );
    }

    // Credit an already-locked user wallet.
    //
    // IMPORTANT:
    // The wallet must already have been locked
    // with lockByUserId() in the same transaction.
    //
    // This method does NOT:
    // - lock the wallet
    // - create a transaction
    // - modify totalEarned
    // - modify totalDeposited
    // - modify totalWithdrawn
    async creditLockedWallet(
        executor: DbExecutor,
        walletId: string,
        balanceAfter: string,
    ) {
        return walletRepository.updateBalances(
            executor,
            walletId,
            {
                availableBalance:
                    balanceAfter,
            },
        );
    }

    // Credit commission.
    async credit(
        executor: DbExecutor,
        userId: string,
        amount: number,
    ) {
        const wallet =
            await this.lockByUserId(
                executor,
                userId,
            );

        const available =
            Number(
                wallet.availableBalance,
            );

        const earned =
            Number(
                wallet.totalEarned,
            );

        return walletRepository.creditCommission(
            executor,
            wallet.id,
            (available + amount).toFixed(2),
            (earned + amount).toFixed(2),
        )
    }

    async holdBalance(
        executor: DbExecutor,
        userId: string,
        amount: number,
    ) {
        amount = walletValidation.validateAmount(amount);

        const wallet = await this.lockByUserId(
            executor,
            userId,
        );

        const available =
            Number(wallet.availableBalance);

        walletValidation.ensureAvailableBalance(
            available,
            amount,
        );

        const held =
            Number(wallet.heldBalance);

        return walletRepository.updateBalances(
            executor,
            wallet.id,
            {
                availableBalance:
                    walletValidation.toDecimal(
                        available - amount,
                    ),

                heldBalance:
                    walletValidation.toDecimal(
                        held + amount,
                    ),
            },
        );
    }

    async releaseHeldBalance(
        executor: DbExecutor,
        userId: string,
        amount: number,
    ) {
        amount = walletValidation.validateAmount(amount);

        const wallet = await this.lockByUserId(
            executor,
            userId,
        );

        const held =
            Number(wallet.heldBalance);

        walletValidation.ensureHeldBalance(
            held,
            amount,
        );

        const available =
            Number(wallet.availableBalance);

        return walletRepository.updateBalances(
            executor,
            wallet.id,
            {
                availableBalance:
                    walletValidation.toDecimal(
                        available + amount,
                    ),

                heldBalance:
                    walletValidation.toDecimal(
                        held - amount,
                    ),
            },
        );
    }

    async debitAvailableBalance(
        executor: DbExecutor,
        userId: string,
        amount: number,
    ) {
        amount = walletValidation.validateAmount(amount);

        const wallet = await this.lockByUserId(
            executor,
            userId,
        );

        const available =
            Number(wallet.availableBalance);

        walletValidation.ensureAvailableBalance(
            available,
            amount,
        );

        return walletRepository.updateBalances(
            executor,
            wallet.id,
            {
                availableBalance:
                    walletValidation.toDecimal(
                        available - amount,
                    ),
            },
        );
    }

    async debitLockedWallet(
        executor: DbExecutor,
        walletId: string,
        balanceAfter: string,
    ) {
        return walletRepository.debitAvailableBalance(
            executor,
            walletId,
            balanceAfter,
        );
    }

    async decreaseHeldBalance(
        executor: DbExecutor,
        userId: string,
        amount: number,
    ) {
        amount = walletValidation.validateAmount(amount);

        const wallet = await this.lockByUserId(
            executor,
            userId,
        );

        const held =
            Number(wallet.heldBalance);

        walletValidation.ensureHeldBalance(
            held,
            amount,
        );

        return walletRepository.updateBalances(
            executor,
            wallet.id,
            {
                heldBalance:
                    walletValidation.toDecimal(
                        held - amount,
                    ),
            },
        );
    }

    async increaseDeposited(
        executor: DbExecutor,
        userId: string,
        amount: number,
    ) {
        amount = walletValidation.validateAmount(amount);

        const wallet = await this.lockByUserId(
            executor,
            userId,
        );

        const totalDeposited =
            Number(wallet.totalDeposited);

        return walletRepository.updateBalances(
            executor,
            wallet.id,
            {
                totalDeposited:
                    walletValidation.toDecimal(
                        totalDeposited + amount,
                    ),
            },
        );
    }

    async increaseWithdrawn(
        executor: DbExecutor,
        userId: string,
        amount: number,
    ) {
        amount = walletValidation.validateAmount(amount);

        const wallet = await this.lockByUserId(
            executor,
            userId,
        );

        const totalWithdrawn =
            Number(wallet.totalWithdrawn);

        return walletRepository.updateBalances(
            executor,
            wallet.id,
            {
                totalWithdrawn:
                    walletValidation.toDecimal(
                        totalWithdrawn + amount,
                    ),
            },
        );
    }
}

export const walletService = new WalletService();