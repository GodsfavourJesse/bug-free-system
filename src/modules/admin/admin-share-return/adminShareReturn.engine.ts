import { withTransaction } from "../../../database/transaction/transaction";
import { sharePurchaseStatus} from "../../../database/enums/share.enum";
import { walletService } from "../../wallet/wallet.service";
import { transactionService } from "../../transaction/transaction.service";
import { ShareReturnAlreadyCreditedError } from "./adminShareReturn.errors";
import { adminShareReturnService } from "./adminShareReturn.service";
import { adminShareReturnRepository } from "./adminShareReturn.repository";

export class AdminShareReturnEngine {

    /**
     * Process a complete share return.
     *
     * Everything runs inside ONE database transaction.
     *
     * Flow:
     *
     * 1. Lock purchase
     * 2. Prevent duplicate payout
     * 3. Validate expiration
     * 4. Lock admin wallet
     * 5. Check admin balance
     * 6. Debit admin wallet
     * 7. Lock user wallet
     * 8. Credit user wallet
     * 9. Create admin transaction
     * 10. Create user transaction
     * 11. Mark purchase RETURN_CREDITED
     *
     * Any failure causes the entire transaction
     * to roll back.
     */
    async processReturn(
        purchaseId: string,
    ) {
        return withTransaction(
            async (tx) => {

                // 1. LOCK PURCHASE
                const purchase = await adminShareReturnRepository.lockById(
                    tx,
                    purchaseId,
                );

                if (!purchase) {
                    throw new Error(
                        "Share purchase not found.",
                    );
                }

                // 2. DUPLICATE PAYOUT PROTECTION
                if (
                    purchase.status ===
                    sharePurchaseStatus.RETURN_CREDITED
                ) {
                    throw new ShareReturnAlreadyCreditedError();
                }

                // 3. VALIDATE EXPIRATION
                adminShareReturnService.validateExpirationLocked(
                    purchase.expiresAt,
                );

                // 4. LOCK ADMIN WALLET
                const adminWallet = await adminShareReturnService.lockAdminWallet(
                    tx,
                );

                // 5. CHECK ADMIN BALANCE
                adminShareReturnService.checkAdminBalance(
                    adminWallet,
                    Number(
                        purchase.totalReturnAmount,
                    ),
                );

                // 6. DEBIT ADMIN WALLET
                const adminDebit = await adminShareReturnService.debitAdminWallet(
                    tx,
                    adminWallet,
                    Number(
                        purchase.totalReturnAmount,
                    ),
                );

                // 7. LOCK USER WALLET
                const userWallet = await walletService.lockByUserId(
                    tx,
                    purchase.userId,
                );

                // 8. CREDIT USER WALLET
                const userCredit = await adminShareReturnService.creditUserWallet(
                    tx,
                    userWallet,
                    Number(
                        purchase.totalReturnAmount,
                    ),
                );

                // 9. CREATE RETURN TRANSACTIONS
                // Both the admin debit and user credit are recorded
                // using the same return reference.
                const returnReference = transactionService.generateReference();

                await adminShareReturnService.createReturnTransactions(
                    tx,
                    {
                        id: purchase.id,
                        userId: purchase.userId,
                        shareId: purchase.shareId,
                    },
                    adminDebit,
                    userCredit,
                    {
                        shareName: purchase.shareName,
                        cycleDays: purchase.cycleDays,
                        returnReference,
                    },
                );

                // 10. MARK RETURN CREDITED
                const updatedPurchase = await adminShareReturnService.markReturnCredited(
                    tx,
                    purchase.id,
                    returnReference,
                );

                if (!updatedPurchase) {
                    throw new Error(
                        "Failed to mark share return as credited.",
                    );
                }

                // COMPLETE
                return {
                    purchase: updatedPurchase,
                    adminDebit,
                    userCredit,
                    returnReference,
                };
            },
        );
    }
}


export const adminShareReturnEngine = new AdminShareReturnEngine();