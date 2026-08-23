import { AdminWalletTransactionType } from "../../../database/enums/admin-wallet-transaction.enum";
import { TransactionStatus, TransactionType } from "../../../database/enums/transaction.enum";
import { withTransaction } from "../../../database/transaction/transaction";
import { DbExecutor } from "../../../database/types/types";
import { adminWalletTransactionService } from "../admin-wallet/admin-wallet-transaction/adminWalletTransaction.sevice";
import { adminWalletService } from "../admin-wallet/adminWallet.service";
import { sharePurchaseRepository } from "../../sharePurchase/sharePurchase.repository";
import { transactionService } from "../../transaction/transaction.service";
import { walletService } from "../../wallet/wallet.service";
import { ShareReturnInsufficientAdminBalanceError, ShareReturnNotExpiredError } from "./adminShareReturn.errors";
import { adminShareReturnRepository } from "./adminShareReturn.repository";

export class AdminShareReturnService {

    // ENsure that the purchase has reached its expiration date.
    private ensureExpired(
        expiresAt: Date,
    ) {
        const now = new Date();

        if (
            expiresAt > now
        ) {
            throw new ShareReturnNotExpiredError();
        }

        return now;
    }

    /**
     * Validate expiration for a locked purchase.
     *
     * This method does not modify anything.
     *
     * It does not:
     * - debit admin wallet
     * - credit user wallet
     * - create transactions
     * - update purchase status
     */
    async validateExpiration(
        purchase:{
            expiresAt: Date,
        },
    ) {
        return withTransaction(
            async (tx) => {

                return this.ensureExpired(
                    purchase.expiresAt,
                );
            },
        );
    }

    /**
     * Lock the admin wallet.
     *
     * This only locks the wallet row.
     *
     * It does not:
     * - check balance
     * - debit balance
     * - create transactions
     */
    async lockAdminWallet(
        executor: DbExecutor,
    ) {
        const result = await adminWalletService.lockWallet(
            executor,
        );

        return result.wallet;
    }

    /**
     * Validate expiration inside an existing database transaction.
    *
    * IMPORTANT:
    * This method does NOT call withTransaction().
    *
    * The ShareReturnEngine already owns the transaction.
     */
    async validateExpirationLocked(
        expiresAt: Date,
    ) {
        return this.ensureExpired(
            expiresAt,
        );
    }

    /**
     * Check admin balance.
     *
     * The admin wallet must already be locked before calling this method.
     *
     * This method does not:
     * - lock the wallet
     * - debit the wallet
     * - credit the user
     * - create transactions
     * - update purchase status
     */
    async checkAdminBalance(
        adminWallet: {
            availableBalance: string | number;
        },
        amount: number,
    ) {
        const availableBalance = Number(
            adminWallet.availableBalance,
        );

        if (
            availableBalance < amount
        ) {
            throw new ShareReturnInsufficientAdminBalanceError();
        }

        return {
            availableBalance,
            requiredAmount: amount,
        };
    }


    /**
     * Debit admin wallet.
     *
     * The admin wallet must already be locked before calling this method.
     *
     * This method:
     * - validates the available balance
     * - calculates the new balance
     * - updates the admin wallet
     *
     * It does not:
     * - lock the wallet
     * - credit the user
     * - create transactions
     * - update purchase status
     */
    async debitAdminWallet(
        executor: DbExecutor,
        adminWallet: {
            id: string;
            userId: string;
            availableBalance: string | number;
        },
        amount: number,
    ) {
        const balanceBefore = Number(
            adminWallet.availableBalance,
        );

        if (
            balanceBefore < amount
        ) {
            throw new ShareReturnInsufficientAdminBalanceError();
        }

        const balanceAfter = balanceBefore - amount;

        await adminWalletService.debitLockedWallet(
            executor,
            adminWallet.id,
            balanceAfter.toFixed(2),
        );

        return {
            walletId: adminWallet.id,
            userId: adminWallet.userId,
            amount,
            balanceBefore,
            balanceAfter,
        };
    }

    /**
     * Credit user wallet.
     *
     * The user wallet must already be locked  before calling this method.
     *
     * This method:
     * - calculates the new available balance
     * - credits the user's available balance
     *
     * It does not:
     * - lock the wallet
     * - debit the admin wallet
     * - create transactions
     * - update purchase status
     */
    async creditUserWallet(
        executor: DbExecutor,
        userWallet: {
            id: string;
            userId: string;
            availableBalance: string | number;
        },
        amount: number,
    ) {
        const balanceBefore = Number(
            userWallet.availableBalance,
        );

        const balanceAfter = balanceBefore + amount;

        await walletService.creditLockedWallet(
            executor,
            userWallet.id,
            balanceAfter.toFixed(2),
        );

        return {
            walletId: userWallet.id,
            userId: userWallet.userId,
            amount,
            balanceBefore,
            balanceAfter,
        };
    }

        /**
     * Piece 7 — Create both transaction records.
     *
     * The wallet balances MUST come from:
     *
     * Piece 5:
     * - admin debit result
     *
     * Piece 6:
     * - user credit result
     *
     * This method does not:
     * - lock either wallet
     * - modify either wallet
     * - update purchase status
     *
     * Both transaction records are created
     * using the same database transaction.
     */
    async createReturnTransactions(
        executor: DbExecutor,

        purchase: {
            id: string;
            userId: string;
            shareId: string;
        },

        adminDebit: {
            walletId: string;
            userId: string;
            amount: number;
            balanceBefore: number;
            balanceAfter: number;
        },

        userCredit: {
            walletId: string;
            userId: string;
            amount: number;
            balanceBefore: number;
            balanceAfter: number;
        },

        data: {
            shareName: string;
            cycleDays: number;
            returnReference: string;
        },
    ) {
        // The amount credited to the user must exactly equal the amount debited from the admin wallet.
        if (
            adminDebit.amount !== userCredit.amount
        ) {
            throw new Error(
                "Admin debit amount and user credit amount must match.",
            );
        }

        // Create the user's return transaction.
        const userTransaction =
            await transactionService.createSystemTransaction(
                executor,
                {
                    userId: userCredit.userId,
                    walletId: userCredit.walletId,
                    type: TransactionType.SHARE_RETURN,
                    amount: userCredit.amount.toFixed(2),
                    balanceBefore: userCredit.balanceBefore.toFixed(2),
                    balanceAfter: userCredit.balanceAfter.toFixed(2),
                    status: TransactionStatus.COMPLETED,
                    reference: data.returnReference,
                    description: `Share return credited for ${data.shareName}.`,

                    metadata: {
                        userId: purchase.userId,
                        shareId: purchase.shareId,
                        sharePurchaseId: purchase.id,
                        shareName: data.shareName,
                        cycleDays: data.cycleDays,
                        returnAmount: userCredit.amount,
                        returnReference: data.returnReference,
                    },
                },
            );

        // Create the admin wallet debit transaction.
        const adminTransaction =
            await adminWalletTransactionService
                .createTransaction(
                    executor,
                    {
                        adminId: adminDebit.userId,
                        type: AdminWalletTransactionType.SHARE_RETURN_DEBIT,
                        amount: adminDebit.amount.toFixed(2),
                        balanceBefore: adminDebit.balanceBefore.toFixed(2),
                        balanceAfter: adminDebit.balanceAfter.toFixed(2),
                        description: `Share return paid to ${data.shareName}.`,

                        metadata: {
                            userId: purchase.userId,
                            shareId: purchase.shareId,
                            sharePurchaseId: purchase.id,
                            shareName: data.shareName,
                            cycleDays: data.cycleDays,
                            returnAmount: adminDebit.amount,
                            returnReference: data.returnReference,
                        },
                    },
                );

        return {
            userTransaction,
            adminTransaction,
        };
    }

    /**
     * Piece 8 — Mark the purchase return as credited.
     *
     * The purchase must already be locked.
     *
     * This method:
     * - changes status to RETURN_CREDITED
     * - stores the return transaction reference
     * - stores the credit timestamp
     *
     * It does not:
     * - lock the purchase
     * - debit admin wallet
     * - credit user wallet
     * - create transactions
     */
    async markReturnCredited(
        executor: DbExecutor,
        purchaseId: string,
        returnReference: string,
    ) {
        const purchase = await adminShareReturnRepository
            .markReturnCredited(
                executor,
                purchaseId,
                returnReference,
            );

        if (!purchase) {
            throw new Error(
                "Share purchase could not be marked as return credited.",
            );
        }

        return purchase;
    }
    
}


export const adminShareReturnService = new AdminShareReturnService();