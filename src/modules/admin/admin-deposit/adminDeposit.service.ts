import { randomUUID } from "crypto";

import { db } from "../../../database";
import { DbExecutor } from "../../../database/types/types";
import { withTransaction } from "../../../database/transaction/transaction";

import { adminDepositRepository } from "./adminDeposit.repository";
import {
    ApproveDepositDto,
    RejectDepositDto,
} from "./adminDeposit.dto";

import { depositValidation } from "../../deposit/deposit.validation";
import { walletService } from "../../wallet/wallet.service";
import { transactionService } from "../../transaction/transaction.service";
import { notificationService } from "../../notification/notification.service";

import {
    TransactionStatus,
    TransactionType,
} from "../../../database/enums/transaction.enum";

import { NotificationType } from "../../../database/enums/notification.enum";

export class AdminDepositService {

    /**
     * ----------------------------------------
     * Find all deposits
     * ----------------------------------------
     */
    async findAllDeposits(
        executor: DbExecutor = db,
    ) {
        return adminDepositRepository.findAll(executor);
    }

    /**
     * ----------------------------------------
     * Find one deposit
     * ----------------------------------------
     */
    async findDepositById(
        depositId: string,
        executor: DbExecutor = db,
    ) {
        return this.findExistingDeposit(
            executor,
            depositId,
        );
    }

    /**
     * ----------------------------------------
     * Pending deposits
     * ----------------------------------------
     */
    async findPendingDeposits(
        executor: DbExecutor = db,
    ) {
        return adminDepositRepository.findPending(
            executor,
        );
    }

    /**
     * ----------------------------------------
     * Approve deposit
     * ----------------------------------------
     */
    async approveDeposit(
        adminId: string,
        depositId: string,
        dto: ApproveDepositDto,
    ) {
        return withTransaction(
            async (tx) => {

                const entity =
                    await this.findExistingDeposit(
                        tx,
                        depositId,
                    );

                const {
                    deposit,
                } = entity;

                depositValidation.ensurePending(
                    deposit,
                );

                const wallet =
                    await walletService.findByUserId(
                        tx,
                        deposit.userId,
                    );

                const amount =
                    Number(
                        deposit.amount,
                    );

                const balanceBefore =
                    Number(
                        wallet.availableBalance,
                    );

                await adminDepositRepository.approve(
                    tx,
                    deposit.id,
                    adminId,
                    dto.adminRemark,
                );

                await walletService.creditBalance(
                    tx,
                    deposit.userId,
                    amount,
                );

                await walletService.increaseDeposited(
                    tx,
                    deposit.userId,
                    amount,
                );

                await this.createDepositTransaction(
                    tx,
                    deposit,
                    wallet.id,
                    balanceBefore,
                    amount,
                );

                await this.notifyDepositApproved(
                    tx,
                    deposit,
                    amount,
                );

                return this.findExistingDeposit(
                    tx,
                    deposit.id,
                );

            },
        );
    }

    /**
     * ----------------------------------------
     * Reject deposit
     * ----------------------------------------
     */
    async rejectDeposit(
        adminId: string,
        depositId: string,
        dto: RejectDepositDto,
    ) {
        return withTransaction(
            async (tx) => {

                const entity =
                    await this.findExistingDeposit(
                        tx,
                        depositId,
                    );

                const {
                    deposit,
                } = entity;

                depositValidation.ensurePending(
                    deposit,
                );

                await adminDepositRepository.decline(
                    tx,
                    deposit.id,
                    adminId,
                    dto.adminRemark,
                );

                await this.notifyDepositRejected(
                    tx,
                    deposit,
                    dto.adminRemark,
                );

                return this.findExistingDeposit(
                    tx,
                    deposit.id,
                );

            },
        );
    }

    /**
     * ----------------------------------------
     * Private Helpers
     * ----------------------------------------
     */

    private async findExistingDeposit(
        executor: DbExecutor,
        depositId: string,
    ) {
        const result =
            await adminDepositRepository.findById(
                executor,
                depositId,
            );

        depositValidation.ensureDepositExists(
            result?.deposit ?? null,
        );

        return result!;
    }

    private async createDepositTransaction(
        executor: DbExecutor,
        deposit: any,
        walletId: string,
        balanceBefore: number,
        amount: number,
    ) {

        await transactionService.createSystemTransaction(
            executor,
            {
                userId: deposit.userId,

                walletId,

                amount: amount.toFixed(2),

                balanceBefore:
                    balanceBefore.toFixed(2),

                balanceAfter:
                    (
                        balanceBefore +
                        amount
                    ).toFixed(2),

                type:
                    TransactionType.DEPOSIT,

                status:
                    TransactionStatus.COMPLETED,

                reference:
                    `DEP-TXN-${Date.now()}-${randomUUID()
                        .replace(/-/g, "")
                        .substring(0, 6)
                        .toUpperCase()}`,

                description:
                    "Wallet deposit approved.",

                metadata: {
                    depositId:
                        deposit.id,

                    depositReference:
                        deposit.reference,
                },
            },
        );

    }

    private async notifyDepositApproved(
        executor: DbExecutor,
        deposit: any,
        amount: number,
    ) {

        await notificationService.notifyUser(
            executor,
            {
                userId:
                    deposit.userId,

                title:
                    "Deposit Approved",

                message:
                    `Your deposit of ₦${amount.toLocaleString(
                        "en-NG",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        },
                    )} has been approved and credited to your wallet.`,

                type:
                    NotificationType.WALLET,

                metadata: {
                    depositId:
                        deposit.id,
                },
            },
        );

    }

    private async notifyDepositRejected(
        executor: DbExecutor,
        deposit: any,
        reason: string,
    ) {

        await notificationService.notifyUser(
            executor,
            {
                userId:
                    deposit.userId,

                title:
                    "Deposit Declined",

                message:
                    "Your deposit request has been declined.",

                type:
                    NotificationType.WALLET,

                metadata: {
                    depositId:
                        deposit.id,

                    reason,
                },
            },
        );

    }

}

export const adminDepositService =
    new AdminDepositService();