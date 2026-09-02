import { db } from "../../database";
import { withTransaction } from "../../database/transaction/transaction";
import { DbExecutor } from "../../database/types/types";

import {
    sharePurchaseRepository,
} from "./sharePurchase.repository";

import {
    sharePurchaseCalculation,
} from "./sharePurchase.calculation";

import {
    SharePurchaseInsufficientBalanceError,
    SharePurchaseNotFoundError,
    ShareNotAvailableError,
} from "./sharePurchase.errors";

import {
    walletService,
} from "../wallet/wallet.service";

import {
    transactionService,
} from "../transaction/transaction.service";

import {
    TransactionStatus,
    TransactionType,
} from "../../database/enums/transaction.enum";


import {
    shareRepository,
} from "../share/share.repository";

import {
    ShareStatus,
} from "../../database/enums/share.enum";
import { adminWalletService } from "../admin/admin-wallet/adminWallet.service";
import { adminWalletTransactionService } from "../admin/admin-wallet/admin-wallet-transaction/adminWalletTransaction.sevice";
import { AdminWalletTransactionDirection, AdminWalletTransactionType } from "../../database/enums/admin-wallet-transaction.enum";
import { randomUUID } from "crypto";

export class SharePurchaseService {

    // Purchase a share.
    // EVERYTHING happens inside one database transaction.
    async purchase(
        userId: string,
        shareId: string,
        amount: number,
    ) {

        return withTransaction(
            async (tx) => {
                // 1. Get share.
                const share = await shareRepository.findById(
                    tx,
                    shareId,
                );

                if (!share) {
                    throw new SharePurchaseNotFoundError();
                }

                // 2. Verify share status.
                // Only IN_PROGRESS shares are open for user investment.
                if (
                    share.status !==
                    ShareStatus.IN_PROGRESS
                ) {
                    throw new ShareNotAvailableError();
                }

                // 3. Calculate purchase.
                const calculation = sharePurchaseCalculation.calculate(
                    amount,
                    Number(
                        share.dailyReturnPercentage,
                    ),
                    share.cycleDays,
                );

                // 4. Lock user wallet.
                // The wallet is locked before checking and changing balance to prevent concurrent purchases from spending the same balance.
                const userWallet = await walletService.lockByUserId(
                    tx,
                    userId,
                );

                const balanceBefore = Number(
                    userWallet.availableBalance,
                );

                // 5. Verify balance.
                if (
                    balanceBefore <
                    calculation.purchaseAmount
                ) {
                    throw new SharePurchaseInsufficientBalanceError();
                }

                const balanceAfter = balanceBefore - calculation.purchaseAmount;

                // 6. Debit user wallet.
                await walletService.debitAvailableBalance(
                    tx,
                    userId,
                    calculation.purchaseAmount,
                );

                // 7. Credit admin wallet.
                const adminCredit =
                    await adminWalletService.credit(
                        tx,
                        calculation.purchaseAmount,
                    );

                // 8. Generate unique share purchase reference.
                const purchaseReference =
                    `SHARE-${Date.now()}-${randomUUID()
                        .replace(/-/g, "")
                        .substring(0, 8)
                        .toUpperCase()}`;

                
                // 9. Create share purchase.
                // We store the purchase terms as a snapshot so future changes to the share do not change an existing user's purchase.
                const purchase = await sharePurchaseRepository.create(
                    tx,
                    {
                        userId,
                        walletId: userWallet.id,
                        shareId,
                        purchaseAmount: calculation.purchaseAmount.toFixed(2),
                        dailyReturnPercentage: share.dailyReturnPercentage,
                        dailyReturnAmount: calculation.dailyReturn.toFixed(2),
                        totalReturnAmount: calculation.totalReturn.toFixed(2),
                        cycleDays: calculation.cycleDays,
                        purchaseReference,
                        expectedReturnAt: calculation.expectedReturnAt,
                        expiresAt:calculation.expiresAt,
                    },
                );

                // 10. Create USER transaction.
                // This represents the debit from the user's wallet.
                const userTransaction = await transactionService.createSystemTransaction(
                    {
                        userId,
                        walletId: userWallet.id,
                        amount: calculation.purchaseAmount.toFixed(2),
                        balanceBefore: balanceBefore.toFixed(2),
                        balanceAfter: balanceAfter.toFixed(2),
                        type: TransactionType.SHARE_PURCHASE,
                        status: TransactionStatus.COMPLETED,
                        description: `Share purchase - ${share.name}`,

                        metadata: {
                            shareId,
                            sharePurchaseId: purchase.id,
                            purchaseReference,
                            shareName: share.name,
                            percentage: Number(
                                share.dailyReturnPercentage,
                            ),
                            cycleDays: share.cycleDays,
                            dailyReturn: calculation.dailyReturn,
                            totalReturn: calculation.totalReturn,
                            expectedReturnAt: calculation.expectedReturnAt,
                            expiresAt: calculation.expiresAt,
                        },
                    },
                    tx,
                );

                // 11. Create ADMIN transaction.
                // This represents the credit to the admin wallet.
                await adminWalletTransactionService.createTransaction(
                    tx,
                    {
                        adminId: adminCredit.userId,
                        type: AdminWalletTransactionType.SHARE_PURCHASE_CREDIT,
                        amount: calculation.purchaseAmount.toFixed(2),
                        balanceBefore: adminCredit.balanceBefore.toFixed(2),
                        balanceAfter: adminCredit.balanceAfter.toFixed(2),
                        description: `Share purchase credit - ${share.name}`,

                        direction: AdminWalletTransactionDirection.CREDIT,

                        metadata: {
                            userId,
                            shareId,
                            sharePurchaseId: purchase.id,
                            purchaseReference,
                            transactionId: userTransaction.id,
                            shareName: share.name,
                            purchaseAmount: calculation.purchaseAmount,
                            dailyReturn: calculation.dailyReturn,
                            totalReturn: calculation.totalReturn,
                            cycleDays: calculation.cycleDays,
                            expectedReturnAt:calculation.expectedReturnAt,
                            expiresAt: calculation.expiresAt,
                        },
                    },
                );

                // 12. Return receipt.
                return {
                    purchase: {
                        id: purchase.id,
                        shareId: share.id,
                        shareName: share.name,
                        logo: share.logo,
                        description: share.description,
                        percentage: Number(
                            share.dailyReturnPercentage,
                        ),
                        cycleDays: share.cycleDays,
                        purchaseAmount: calculation.purchaseAmount,
                        dailyReturn: calculation.dailyReturn,
                        totalReturn: calculation.totalReturn,
                        status: purchase.status,
                        purchaseReference,
                        purchasedAt: purchase.createdAt,
                        expectedReturnAt: calculation.expectedReturnAt,
                        expiresAt: calculation.expiresAt,
                    },

                    transaction: userTransaction,
                };
            },
        );
    }

    // Get a purchase.
    async findById(
        id: string,
    ) {
        const purchase = await sharePurchaseRepository.findById(
            db,
            id,
        );

        if (!purchase) {
            throw new SharePurchaseNotFoundError();
        }

        return purchase;
    }

    // Get all purchases belonging to the authenticated user.
    async findByUser(
        userId: string,
    ) {
        return sharePurchaseRepository.findByUser(
            db,
            userId,
        );
    }
}

export const sharePurchaseService = new SharePurchaseService();