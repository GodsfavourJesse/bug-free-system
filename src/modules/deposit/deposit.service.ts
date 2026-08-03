import { randomUUID } from "crypto";
import { DepositStatus } from "../../database/enums/deposit.enum";
import { NotificationType } from "../../database/enums/notification.enum";
import { withTransaction } from "../../database/transaction/transaction";
import { notificationService } from "../notification/notification.service";
import { walletService } from "../wallet/wallet.service";
import { CreateDepositDto } from "./deposit.dto";
import { depositRepository } from "./deposit.repository";
import { depositValidation } from "./deposit.validation";
import { db } from "../../database";

export class DepositService {

    private generateReference() {
        return `DEP-${Date.now()}-${randomUUID()
            .replace(/-/g, "")
            .substring(0, 8)
            .toUpperCase()}`;
    }

    async requestDeposit(
        userId: string,
        dto: CreateDepositDto,
    ) {
        return withTransaction(
            async (tx) => {

                // Validate amount.
                depositValidation.validateAmount(
                    dto.amount,
                );

                // Validate receipt.
                depositValidation.validateReceipt(
                    dto.paymentReceipt,
                );

                // Ensure wallet exists.
                const wallet =
                    await walletService.findByUserId(
                        tx,
                        userId,
                    );

                // Ensure no pending deposit.
                const pending =
                    await depositRepository.findPendingByUser(
                        tx,
                        userId,
                    );

                depositValidation.ensureNoPendingDeposit(
                    pending,
                );

                // Generate deposit reference.
                const reference =
                    this.generateReference();

                // Create deposit request.
                const deposit =
                    await depositRepository.create(
                        tx,
                        {
                            reference,

                            userId,

                            walletId: wallet.id,

                            amount:
                                dto.amount.toFixed(
                                    2,
                                ),

                            accountName:
                                dto.senderAccountName,

                            accountNumber:
                                dto.senderAccountNumber,

                            bankName:
                                dto.senderBankName,

                            paymentReceipt:
                                dto.paymentReceipt,

                            status:
                                DepositStatus.PENDING,
                        },
                    );

                // Notify every admin.
                await notificationService.notifyAdmins(
                    tx,
                    {
                        title:
                            "New Deposit Request",

                        message:
                            `A new deposit request (${reference}) has been submitted.`,

                        type:
                            NotificationType.DEPOSIT,

                        metadata: {
                            depositId:
                                deposit.id,
                        },
                    },
                );

                // Notify user.
                await notificationService.notifyUser(
                    tx,
                    {
                        userId,

                        title:
                            "Deposit Submitted",

                        message:
                            "Your deposit request has been submitted successfully and is awaiting review.",

                        type:
                            NotificationType.DEPOSIT,

                        metadata: {
                            depositId:
                                deposit.id,
                        },
                    },
                );

                return deposit;

            },
        );
    }

    async findMyDeposits(
        userId: string,
    ) {
        return depositRepository.findByUser(
            db,
            userId,
        );
    }

    async findDeposit(
        userId: string,
        depositId: string,
    ) {
        // Find the deposit.
        const deposit =
            await depositRepository.findById(
                db,
                depositId,
            );

        // Ensure it exists.
        depositValidation.ensureDepositExists(
            deposit,
        );

        // Ensure it belongs to the authenticated user.
        depositValidation.ensureBelongsToUser(
            deposit,
            userId,
        );

        return deposit;
    }

    async cancelDeposit(
        userId: string,
        depositId: string,
    ) {
        return withTransaction(
            async (tx) => {

                // Find the deposit.
                const deposit =
                    await depositRepository.findById(
                        tx,
                        depositId,
                    );

                // Ensure it exists.
                depositValidation.ensureDepositExists(
                    deposit,
                );

                // Ensure it belongs to the authenticated user.
                depositValidation.ensureBelongsToUser(
                    deposit,
                    userId,
                );

                // Ensure it is still pending.
                depositValidation.ensurePending(
                    deposit,
                );

                // Cancel the deposit.
                const cancelled =
                    await depositRepository.cancel(
                        tx,
                        depositId,
                    );

                return cancelled;

            },
        );
    }

    async findDepositByReference(
        userId: string,
        reference: string,
    ) {
        const deposit =
            await depositRepository.findByReference(
                db,
                reference,
            );

        depositValidation.ensureDepositExists(
            deposit,
        );

        depositValidation.ensureBelongsToUser(
            deposit,
            userId,
        );

        return deposit;
    }

    async getPendingDeposit(userId: string) {
        const deposit =
            await depositRepository.findPendingByUser(
                db,
                userId,
            );

        if (!deposit) {
            return {
                hasPending: false,
            };
        }

        return {
            hasPending: true,
            deposit,
        };
    }
}

export const depositService =
    new DepositService();