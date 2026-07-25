import { db } from "@/database";

import { withTransaction } from "@/database/transaction/transaction";

import { upgradeRepository } from "@/modules/upgrade/upgrade.repository";

import { upgradeValidation } from "@/modules/upgrade/upgrade.validation";

import { adminUpgradeValidation } from "./adminUpgrade.validation";
import { UpgradeRequestStatus } from "@/database/enums/upgrade.enum";
import { UpgradeAlreadyProcessedError } from "@/modules/upgrade/upgrade.errors";
import { userRepository } from "@/modules/user/user.repository";
import { walletService } from "@/modules/wallet/wallet.service";
import { transactionService } from "@/modules/transaction/transaction.service";
import { TransactionStatus, TransactionType } from "@/database/enums/transaction.enum";
import { notificationService } from "@/modules/notification/notification.service";
import { NotificationType } from "@/database/enums/notification.enum";
import { commissionService } from "@/modules/commission/commission.service";
import { COMMISSION_SOURCES } from "@/constants/commision.constants";

export class AdminUpgradeService {

    // Mark an upgrade request as under review.
    async markUnderReview(
        requestId: string,
        adminId: string,
    ) {
        return withTransaction(
            async (tx) => {

                // Find request.
                const request =
                    upgradeValidation.ensureUpgradeRequestExists(
                        await upgradeRepository.findById(
                            tx,
                            requestId,
                        ),
                    );

                // Ensure request is pending.
                adminUpgradeValidation.ensurePendingRequest(
                    request,
                );

                // Update request.
                const updatedRequest = await upgradeRepository.markUnderReview(
                    tx,
                    request.id,
                    adminId,
                );

                await notificationService.notifyUser(tx, {
                    userId: request.userId,
                    title: "Upgrade Under Review",
                    message:
                        "Your membership upgrade request is currently under review.",
                    type: NotificationType.UPGRADE,
                    metadata: {
                        upgradeRequestId: request.id,
                    },
                });

                return updatedRequest;
            },
        );
    }

    // Approve an upgrade request.
    async approve(
        requestId: string,
        adminId: string,
        adminNote?: string,
    ) {
        return withTransaction(async (tx) => {

            // Find upgrade request
            const request = upgradeValidation.ensureUpgradeRequestExists(
                await upgradeRepository.findById(
                    tx,
                    requestId,
                ),
            );

            // Request must be under review
            if (
                request.status !==
                UpgradeRequestStatus.UNDER_REVIEW
            ) {
                throw new UpgradeAlreadyProcessedError();
            }

            // Lock user
            const user = await userRepository.lockById(
                tx,
                request.userId,
            );

            if (!user) {
                throw new Error(
                    "User not found.",
                );
            }

            // Lock wallet
            const wallet = await walletService.findByUserId(
                tx,
                request.userId,
            );

            // Create transaction
            const transaction = await transactionService.createSystemTransaction(
                tx,
                {
                    userId: user.id,
                    walletId: wallet.id,
                    amount: request.amount,

                    balanceBefore: wallet.availableBalance,

                    balanceAfter: wallet.availableBalance,

                    type: TransactionType.PURCHASE,
                    status: TransactionStatus.COMPLETED,
                    reference: request.reference,
                    description: "Membership upgrade approved.",

                    metadata: {
                        upgradeRequestId:
                        request.id,
                    },
                },
            );

            // Update user's membership
            await userRepository.updateMembership(
                tx,
                user.id,
                request.requestedMembershipPlanId,
                false,
            );

            // Process referral commissions
            await commissionService.processMembershipUpgrade(
                tx,
                {
                    buyerId: user.id,
                    membershipPlanId: request.requestedMembershipPlanId,
                    amount: Number(request.amount),
                    reference: request.reference,
                },
            );

            // Mark request approved
            const approvedRequest = await upgradeRepository.approve(
                tx,
                request.id,
                adminId,
                transaction.id,
                adminNote,
            );

            //--------------------------------------------------
            // Audit Module
            //--------------------------------------------------
            // TODO:
            // auditService.log(...)

            // Notification Module
            await notificationService.notifyUser(tx, {
                userId: request.userId,
                title: "Upgrade Approved",
                message: "Congratulations! Your membership upgrade has been approved.",
                type: NotificationType.UPGRADE,
                metadata: {
                    upgradeRequestId: request.id,
                    transactionId: transaction.id,
                },
            });

            return approvedRequest;
        });
    }

    // Reject an upgrade request.
    async reject(
        requestId: string,
        adminId: string,
        rejectedReason: string,
        adminNote?: string,
    ) {
        return withTransaction(async (tx) => {

            // Find the upgrade request.
            const request = upgradeValidation.ensureUpgradeRequestExists(
                await upgradeRepository.findById(
                    tx,
                    requestId,
                ),
            );

            // Only requests under review can be rejected.
            if (
                request.status !==
                UpgradeRequestStatus.UNDER_REVIEW
            ) {
                throw new UpgradeAlreadyProcessedError();
            }

            // Reject the request.
            const rejectedRequest = await upgradeRepository.reject(
                tx,
                request.id,
                adminId,
                rejectedReason,
                adminNote,
            );

            //--------------------------------------------------
            // Audit Module
            //--------------------------------------------------
            // TODO:
            // auditService.log(...)

            // Notification Module
            await notificationService.notifyUser(tx, {
                userId: request.userId,
                title: "Upgrade Rejected",
                message:
                    `Your membership upgrade request was rejected. Reason: ${rejectedReason}`,
                type: NotificationType.UPGRADE,
                metadata: {
                    upgradeRequestId: request.id,
                },
            });

            return rejectedRequest;
        });
    }
}

export const adminUpgradeService =
    new AdminUpgradeService();