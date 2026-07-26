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

export class WithdrawalService {

    // Create a withdrawal request.
    async createWithdrawal(
        dto: CreateWithdrawalDto,
    ) {
        return withTransaction(
            async (tx) => {

                const wallet = await walletService.findByUserId(
                    tx,
                    dto.userId,
                );

                const amount = Number(dto.amount);

                withdrawalValidation.ensureValidAmount(amount);

                withdrawalValidation.ensureSufficientBalance(
                    Number(
                        wallet.availableBalance,
                    ),
                    amount,
                );
                
                await walletService.holdBalance(
                    tx,
                    dto.userId,
                    amount,
                );

                const withdrawal = await withdrawalRepository.create(
                    tx,
                    {
                        userId: dto.userId,

                        walletId: wallet.id,

                        amount: dto.amount,

                        accountName: dto.accountName,

                        accountNumber: dto.accountNumber,

                        bankName: dto.bankName,
                    },
                );

                await notificationService.notifyAdmins(
                    tx,
                    {
                        title:
                            "New Withdrawal Request",

                        message:
                            `A new withdrawal request of ₦${dto.amount} has been submitted.`,

                        type:
                            NotificationType.WITHDRAWAL,

                        metadata: {
                            withdrawalId:
                                withdrawal.id,

                            userId:
                                dto.userId,
                        },
                    },
                );

                return withdrawal;
            },
        );
    }

    // Return every withdrawal
    // belonging to a user.
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
        const withdrawal =
            await withdrawalRepository.findById(
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

                const approved = await withdrawalRepository.approve(
                    tx,
                    dto.withdrawalId,
                    dto.adminId,
                    dto.adminRemark,
                );

                await this.notifyUser(
                    tx,
                    approved.userId,
                    "Withdrawal Approved",
                    `Your withdrawal request of ₦${approved.amount} has been approved and is awaiting payment.`,
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

                await this.refundRejectedWithdrawal(
                    tx,
                    withdrawal.userId,
                    Number(
                        withdrawal.amount,
                    ),
                );

                const rejected = await withdrawalRepository.reject(
                    tx,
                    dto.withdrawalId,
                    dto.adminId,
                    dto.adminRemark,
                );

                await this.notifyUser(
                    tx,
                    rejected.userId,
                    "Withdrawal Rejected",
                    `Your withdrawal request of ₦${rejected.amount} was rejected.${dto.adminRemark ? ` Reason: ${dto.adminRemark}` : ""}`,
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

                withdrawalValidation.ensureNotAlreadyPaid(
                    withdrawal,
                );

                const wallet =
                    await walletService.findByUserId(
                        tx,
                        withdrawal.userId,
                    );

                const balanceBefore =
                    Number(
                        wallet.availableBalance,
                    ) +
                    Number(
                        wallet.heldBalance,
                    );

                const balanceAfter =
                    balanceBefore -
                    Number(
                        withdrawal.amount,
                    );

                await walletService.decreaseHeldBalance(
                    tx,
                    withdrawal.userId,
                    Number(
                        withdrawal.amount,
                    ),
                );

                await walletService.increaseWithdrawn(
                    tx,
                    withdrawal.userId,
                    Number(
                        withdrawal.amount,
                    ),
                );

                const paid =
                    await withdrawalRepository.markPaid(
                        tx,
                        dto.withdrawalId,
                    );

                await this.createTransaction(
                    tx,
                    paid,
                    balanceBefore,
                    balanceAfter,
                );

                await this.notifyUser(
                    tx,
                    paid.userId,
                    "Withdrawal Paid",
                    `Your withdrawal of ₦${paid.amount} has been marked as paid.`,
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
                userId:
                    withdrawal.userId,

                walletId:
                    withdrawal.walletId,

                amount:
                    withdrawal.amount,

                balanceBefore:
                    balanceBefore.toFixed(2),

                balanceAfter:
                    balanceAfter.toFixed(2),

                type:
                    TransactionType.WITHDRAWAL,

                status:
                    TransactionStatus.COMPLETED,

                reference:
                    transactionService.generateReference(),

                description:
                    "Withdrawal paid.",

                metadata: {
                    withdrawalId:
                        withdrawal.id,
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
export const withdrawalService =
    new WithdrawalService();