import { walletRepository } from "./wallet.repository";
import { WalletAlreadyExistsError } from "./wallet.errors";
import { walletValidation } from "./wallet.validation";
import { withTransaction } from "../../database/transaction/transaction";
import { DbExecutor } from "../../database/types/types";
import { db } from "../../database";

export class WalletService {

    /**
     * Create a wallet for a new user.
     *
     * A user can only own one wallet.
     */
    async createWallet(
        userId: string,
    ) {
        return withTransaction(
            async (tx) => {
                const existingWallet =
                    await walletRepository.findByUserId(
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

    /**
     * Find wallet by ID.
     */
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

    /**
     * Return a user's wallet.
     */
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

    /**
     * Retrieve a user's wallet.
     */
    async getWallet(
        userId: string,
    ) {
        return this.findByUserId(
            db,
            userId,
        );
    }

    /**
     * Return current wallet balances.
     */
    async getBalance(
        userId: string,
    ) {
        const wallet =
            await this.getWallet(userId);

        return {
            availableBalance:
                wallet.availableBalance,

            heldBalance:
                wallet.heldBalance,

            totalEarned:
                wallet.totalEarned,

            totalDeposited:
                wallet.totalDeposited,

            totalWithdrawn:
                wallet.totalWithdrawn,
        };
    }

    /**
     * Lock a user's wallet row.
     *
     * IMPORTANT:
     * Must be used inside a transaction.
     */
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

    /**
     * Credit available balance.
     */
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
            Number(
                wallet.availableBalance,
            );

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

    /**
     * Credit an already locked wallet.
     *
     * Does NOT:
     * - lock the wallet
     * - create a transaction
     * - modify totals
     */
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

    /**
     * Credit commission to a user.
     */
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
        );
    }

    /**
     * Move money from AVAILABLE to HELD.
     *
     * Used when:
     * - Upgrade request is created
     * - Withdrawal request is created
     * - Other temporary reservations
     *
     * Example:
     *
     * Available: ₦100,000
     * Held:      ₦0
     *
     * Hold ₦21,600
     *
     * Available: ₦78,400
     * Held:      ₦21,600
     */
    async holdBalance(
        executor: DbExecutor,
        userId: string,
        amount: number,
    ) {
        amount =
            walletValidation.validateAmount(
                amount,
            );

        const wallet =
            await this.lockByUserId(
                executor,
                userId,
            );

        const available =
            Number(
                wallet.availableBalance,
            );

        walletValidation.ensureAvailableBalance(
            available,
            amount,
        );

        const held =
            Number(
                wallet.heldBalance,
            );

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

    /**
     * Release money from HELD back to AVAILABLE.
     *
     * Used when:
     * - Upgrade is rejected
     * - Upgrade is cancelled
     * - Withdrawal is rejected/cancelled
     */
    async releaseHeldBalance(
        executor: DbExecutor,
        userId: string,
        amount: number,
    ) {
        amount =
            walletValidation.validateAmount(
                amount,
            );

        const wallet =
            await this.lockByUserId(
                executor,
                userId,
            );

        const held =
            Number(
                wallet.heldBalance,
            );

        walletValidation.ensureHeldBalance(
            held,
            amount,
        );

        const available =
            Number(
                wallet.availableBalance,
            );

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

    /**
     * Complete a payment using money that is
     * already in HELD balance.
     *
     * This is intentionally different from
     * debitAvailableBalance().
     *
     * At this stage the money has already been
     * removed from availableBalance when the
     * request was created.
     *
     * Approval therefore only removes the money
     * from heldBalance.
     *
     * Example:
     *
     * Available: ₦78,400
     * Held:      ₦21,600
     *
     * Complete ₦21,600 payment:
     *
     * Available: ₦78,400
     * Held:      ₦0
     */
    async completeHeldPayment(
        executor: DbExecutor,
        userId: string,
        amount: number,
    ) {
        amount =
            walletValidation.validateAmount(
                amount,
            );

        const wallet =
            await this.lockByUserId(
                executor,
                userId,
            );

        const held =
            Number(
                wallet.heldBalance,
            );

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

    /**
     * Debit available balance.
     */
    async debitAvailableBalance(
        executor: DbExecutor,
        userId: string,
        amount: number,
    ) {
        amount =
            walletValidation.validateAmount(
                amount,
            );

        const wallet =
            await this.lockByUserId(
                executor,
                userId,
            );

        const available =
            Number(
                wallet.availableBalance,
            );

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

    /**
     * Debit an already locked wallet.
     */
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

    /**
     * Decrease held balance.
     *
     * Kept for existing consumers such as
     * withdrawal-related logic.
     */
    async decreaseHeldBalance(
        executor: DbExecutor,
        userId: string,
        amount: number,
    ) {
        amount =
            walletValidation.validateAmount(
                amount,
            );

        const wallet =
            await this.lockByUserId(
                executor,
                userId,
            );

        const held =
            Number(
                wallet.heldBalance,
            );

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

    /**
     * Increase total deposited.
     */
    async increaseDeposited(
        executor: DbExecutor,
        userId: string,
        amount: number,
    ) {
        amount =
            walletValidation.validateAmount(
                amount,
            );

        const wallet =
            await this.lockByUserId(
                executor,
                userId,
            );

        const totalDeposited =
            Number(
                wallet.totalDeposited,
            );

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

    /**
     * Increase total withdrawn.
     */
    async increaseWithdrawn(
        executor: DbExecutor,
        userId: string,
        amount: number,
    ) {
        amount =
            walletValidation.validateAmount(
                amount,
            );

        const wallet =
            await this.lockByUserId(
                executor,
                userId,
            );

        const totalWithdrawn =
            Number(
                wallet.totalWithdrawn,
            );

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

export const walletService =
    new WalletService();