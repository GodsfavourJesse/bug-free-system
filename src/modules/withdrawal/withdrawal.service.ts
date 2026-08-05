import { withdrawalRepository } from "./withdrawal.repository";
import { withdrawalValidation } from "./withdrawal.validation";

import {
    ApproveWithdrawalDto,
    CreateWithdrawalDto,
    MarkWithdrawalPaidDto,
    RejectWithdrawalDto,
} from "./withdrawal.dto";
import { transactionService } from "../transaction/transaction.service";
import { withTransaction } from "../../database/transaction/transaction";
import { walletService } from "../wallet/wallet.service";
import { notificationService } from "../notification/notification.service";
import { NotificationType } from "../../database/enums/notification.enum";
import { db } from "../../database";
import { DbExecutor } from "../../database/types/types";
import { TransactionStatus, TransactionType } from "../../database/enums/transaction.enum";
import { adminWalletService } from "../admin/admin-wallet/adminWallet.service";
import { adminWalletTransactionService } from "../admin/admin-wallet/admin-wallet-transaction/adminWalletTransaction.sevice";

export class WithdrawalService {

    // Notify the administrator that a withdrawal request has been submitted.
    private async notifyAdmins(
        executor: DbExecutor,
        withdrawalId: string,
        userId: string,
        amount: string,
    ) {
        await notificationService.notifyAdmins(
            executor,
            {
                title: "New Withdrawal Request",

                message: `A new withdrawal request of ₦${amount} has been submitted and is waiting review.`,

                type: NotificationType.WITHDRAWAL,

                metadata: {
                    withdrawalId,
                    userId,
                },
            },
        );
    }

    // Notify user after successfully submitting a withdrawal request.
    private async notifyWithdrawalSubmitted(
        executor: DbExecutor,
        userId: string,
        amount: string,
        withdrawalId: string,
    ) {
        await notificationService.notifyUser(
            executor,
            {
                userId,
                title:  "Withdrawal Request Submitted",

                message: `Your withdrawal request of ₦${amount} has been submitted successfully. You can monitor its status from your Transactions page.`,

                type: NotificationType.WITHDRAWAL,

                metadata: {
                    withdrawalId,
                },
            },
        );
    }

    // Create a withdrawal request.
    async createWithdrawal(
        dto: CreateWithdrawalDto,
    ) {
        return withTransaction(
            async (tx) => {

                // Validate amount
                const amount = Number(dto.amount);

                withdrawalValidation.ensureValidAmount(
                    amount,
                );

                withdrawalValidation.ensureMinimumAmount(
                    amount,
                );

                // Lock wallet
                const wallet = await walletService.lockByUserId(
                    tx,
                    dto.userId,
                );

                // Validation balance
                withdrawalValidation.ensureSufficientBalance(
                    Number(
                        wallet.availableBalance,
                    ),
                    amount,
                );

                // Store balance
                const balanceBefore = Number(
                    wallet.availableBalance,
                );

                const balanceAfter = balanceBefore - amount;

                // Hold funds
                await walletService.holdBalance(
                    tx,
                    dto.userId,
                    amount,
                );

                // Create withdrawal
                const withdrawal = await withdrawalRepository.create(
                    tx,
                    {
                        userId: dto.userId,
                        walletId: wallet.id,
                        amount: dto.amount,
                        accountName: dto.accountName,
                        accountNumber: dto.accountNumber,
                        bankName: dto.bankName,
                    }
                )

                // Create Pending Transaction
                await transactionService.createSystemTransaction(
                    tx,
                    {
                        userId: dto.userId,
                        walletId: wallet.id,
                        type: TransactionType.WITHDRAWAL,
                        amount: dto.amount,
                        balanceBefore: balanceBefore.toFixed(
                            2,
                        ),
                        balanceAfter: balanceAfter.toFixed(
                            2,
                        ),
                        status: TransactionStatus.PENDING,
                        reference: transactionService.generateReference(),
                        description: "Withdrawal request submitted.",

                        metadata: {
                            withdrawalId: withdrawal.id,
                        },
                    },
                );

                // Notify Admin
                await this.notifyAdmins(
                    tx,
                    withdrawal.id,
                    dto.userId,
                    dto.amount,
                );

                // Notify User
                await this.notifyWithdrawalSubmitted(
                    tx,
                    dto.userId,
                    dto.amount,
                    withdrawal.id,
                );

                // Done
                return withdrawal;
            }
        )
    }

    // Return every withdrawal belonging to a user.
    async getUserWithdrawals(
        userId: string,
    ) {
        return withdrawalRepository.findByUser(
            db,
            userId,
        );
    }

    // Return one withdrawal.
    async getWithdrawal(
        withdrawalId: string,
        executor: DbExecutor = db,
    ) {
        const withdrawal = await withdrawalRepository.findById(
            executor,
            withdrawalId,
        );

        return withdrawalValidation.ensureWithdrawalExists(
            withdrawal,
        );
    }

    // Approve a withdrawal request.
    async approveWithdrawal(
        dto: ApproveWithdrawalDto,
    ) {
        return withTransaction(
            async (tx) => {

                // Lock withdrawal
                const withdrawal =
                    await withdrawalRepository.lockById(
                        tx,
                        dto.withdrawalId,
                    );

                withdrawalValidation.ensureWithdrawalExists(
                    withdrawal,
                );

                withdrawalValidation.ensurePending(
                    withdrawal,
                );

                // Approve withdrawal
                const approved =
                    await withdrawalRepository.approve(
                        tx,
                        withdrawal.id,
                        dto.adminId,
                        dto.adminRemark,
                    );

                // Notify user
                await notificationService.notifyUser(
                    tx,
                    {
                        userId: approved.userId,

                        title: "Withdrawal Approved",

                        message:
                            `Your withdrawal request of ₦${Number(
                                approved.amount,
                            ).toLocaleString(
                                "en-NG",
                            )} has been approved and is awaiting payment.`,

                        type: NotificationType.WITHDRAWAL,

                        metadata: {
                            withdrawalId: approved.id,
                            amount: approved.amount,
                        },
                    },
                );

                return approved;
            },
        );
    }

    // Reject a withdrawal request.
    async rejectWithdrawal(
        dto: RejectWithdrawalDto,
    ) {
        return withTransaction(
            async (tx) => {

                // Lock withdrawal
                const withdrawal = await withdrawalRepository.lockById(
                    tx,
                    dto.withdrawalId,
                );

                withdrawalValidation.ensureWithdrawalExists(
                    withdrawal,
                );

                withdrawalValidation.ensurePending(
                    withdrawal,
                );

                const amount = Number(
                    withdrawal.amount,
                );

                // Release held funds
                await walletService.releaseHeldBalance(
                    tx,
                    withdrawal.userId,
                    amount,
                );

                // Update transaction
                await transactionService.updateTransactionStatusByWithdrawalId(
                    tx,
                    withdrawal.id,
                    TransactionStatus.CANCELLED,
                );

                // Reject withdrawal
                const rejected = await withdrawalRepository.reject(
                    tx,
                    dto.withdrawalId,
                    dto.adminId,
                    dto.adminRemark,
                );

                // Notify user
                await notificationService.notifyUser(
                    tx,
                    {
                        userId: rejected.userId,
                        title: "Withdrawal Rejected",

                        message:
                            `Your withdrawal request of ₦${Number(
                                rejected.amount,
                            ).toLocaleString(
                                "en-NG",
                            )} was rejected.`,

                        type: NotificationType.WITHDRAWAL,

                        metadata: {
                            withdrawalId: rejected.id,
                        },
                    },
                );

                return rejected;
            },
        );
    }

    // Mark an approved withdrawal as paid.
    async markPaid(
        dto: MarkWithdrawalPaidDto,
    ) {
        return withTransaction(
            async (tx) => {

                // Lock withdrawal
                const withdrawal =
                    await withdrawalRepository.lockById(
                        tx,
                        dto.withdrawalId,
                    );

                withdrawalValidation.ensureWithdrawalExists(
                    withdrawal,
                );

                withdrawalValidation.ensureApproved(
                    withdrawal,
                );

                const amount = Number(
                    withdrawal.amount,
                );

                // Remove funds from held balance
                await walletService.decreaseHeldBalance(
                    tx,
                    withdrawal.userId,
                    amount,
                );

                // Increase user's lifetime withdrawn amount
                await walletService.increaseWithdrawn(
                    tx,
                    withdrawal.userId,
                    amount,
                );

                // Debit admin wallet
                const adminWallet =
                    await adminWalletService.debit(
                        tx,
                        amount,
                    );

                // Mark withdrawal as paid
                const paid =
                    await withdrawalRepository.markPaid(
                        tx,
                        withdrawal.id,
                    );

                // Complete user's pending withdrawal transaction
                await transactionService.updateTransactionStatusByWithdrawalId(
                    tx,
                    paid.id,
                    TransactionStatus.COMPLETED,
                );

                // Record admin wallet transaction
                await adminWalletTransactionService.createTransaction(
                    tx,
                    {
                        adminId: adminWallet.userId,

                        type:
                            TransactionType.ADMIN_WITHDRAWAL,

                        amount:
                            amount.toFixed(2),

                        balanceBefore:
                            adminWallet.balanceBefore.toFixed(
                                2,
                            ),

                        balanceAfter:
                            adminWallet.balanceAfter.toFixed(
                                2,
                            ),

                        description:
                            "Withdrawal payment",

                        metadata: {
                            withdrawalId: paid.id,
                            userId: paid.userId,
                        },
                    },
                );

                // Notify user
                await notificationService.notifyUser(
                    tx,
                    {
                        userId: paid.userId,

                        title: "Withdrawal Paid",

                        message:
                            `₦${amount.toLocaleString(
                                "en-NG",
                            )} has been successfully paid into your bank account.`,

                        type:
                            NotificationType.WITHDRAWAL,

                        metadata: {
                            withdrawalId: paid.id,
                            amount: paid.amount,
                        },
                    },
                );

                return paid;
            },
        );
    }

    // Release a user's held balance after
    // a withdrawal is rejected.
    async refundRejectedWithdrawal(
        executor: DbExecutor,
        userId: string,
        amount: number,
    ) {
        return walletService.releaseHeldBalance(
            executor,
            userId,
            amount,
        );
    }

    // Create a transaction record
    // after a withdrawal is paid.
    async createTransaction(
        executor: DbExecutor,
        withdrawal: Awaited<
            ReturnType<
                typeof withdrawalRepository.findById
            >
        >,
        balanceBefore: number,
        balanceAfter: number,
    ) {
        if (!withdrawal) {
            return;
        }

        await transactionService.createSystemTransaction(
            executor,
            {
                userId: withdrawal.userId,
                walletId: withdrawal.walletId,
                amount: withdrawal.amount,
                balanceBefore: balanceBefore.toFixed(2),
                balanceAfter: balanceAfter.toFixed(2),
                type: TransactionType.WITHDRAWAL,
                status: TransactionStatus.COMPLETED,
                reference: transactionService.generateReference(),
                description: "Withdrawal paid.",
                metadata: {
                    withdrawalId: withdrawal.id,
                },
            },
        );
    }

    // Notify a user about a withdrawal.
    async notifyUser(
        executor: DbExecutor,
        userId: string,
        title: string,
        message: string,
    ) {
        await notificationService.notifyUser(
            executor,
            {
                userId,
                title,
                message,
                type: NotificationType.WITHDRAWAL,
            },
        );
    }

}
export const withdrawalService = new WithdrawalService();