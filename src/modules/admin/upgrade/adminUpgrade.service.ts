import { NotificationType } from "../../../database/enums/notification.enum";
import {
    TransactionStatus,
    TransactionType,
} from "../../../database/enums/transaction.enum";
import { UpgradeRequestStatus } from "../../../database/enums/upgrade.enum";
import { withTransaction } from "../../../database/transaction/transaction";

import { commissionService } from "../../commission/commission.service";
import { notificationService } from "../../notification/notification.service";
import { transactionService } from "../../transaction/transaction.service";

import { UpgradeAlreadyProcessedError } from "../../upgrade/upgrade.errors";
import { upgradeRepository } from "../../upgrade/upgrade.repository";
import { upgradeValidation } from "../../upgrade/upgrade.validation";

import { userRepository } from "../../user/user.repository";
import { walletService } from "../../wallet/wallet.service";

import { adminUpgradeRepository } from "./adminUpgrade.repository";
import { adminUpgradeValidation } from "./adminUpgrade.validation";

interface AdminUpgradeResponse {
    id: string;
    amount: string;
    paymentMethod: string;
    paymentProof: string | null;
    reference: string;
    status: string;
    metadata: Record<string, unknown> | null;
    transactionId: string | null;
    reviewedBy: string | null;
    reviewedAt: string | null;
    rejectedReason: string | null;
    adminNote: string | null;
    createdAt: string;
    updatedAt: string;

    user: {
        id: string;
        email: string | null;
        phone: string;
        referralCode: string;
    } | null;

    currentMembership: {
        id: string;
        name: string;
        slug: string;
    } | null;

    requestedMembership: {
        id: string;
        name: string;
        slug: string;
    } | null;
}

interface RawUpgradeRow {
    request: {
        id: string;
        userId: string;
        currentMembershipPlanId: string;
        requestedMembershipPlanId: string;
        amount: string;
        paymentMethod: string;
        paymentProof: string | null;
        reference: string;
        status: string;
        metadata: Record<string, unknown> | null;
        transactionId: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        rejectedReason: string | null;
        adminNote: string | null;
        createdAt: Date;
        updatedAt: Date;
    };

    user: {
        id: string;
        email: string | null;
        phone: string;
        referralCode: string;
    } | null;

    currentMembershipPlan: {
        id: string;
        name: string;
        slug: string;
    } | null;

    requestedMembershipPlan: {
        id: string;
        name: string;
        slug: string;
    } | null;
}

function mapUpgradeRequest(
    row: RawUpgradeRow,
): AdminUpgradeResponse {
    return {
        id: row.request.id,
        amount: row.request.amount,
        paymentMethod: row.request.paymentMethod,
        paymentProof: row.request.paymentProof,
        reference: row.request.reference,
        status: row.request.status,
        metadata: row.request.metadata,
        transactionId: row.request.transactionId,
        reviewedBy: row.request.reviewedBy,
        reviewedAt:
            row.request.reviewedAt?.toISOString() ??
            null,
        rejectedReason:
            row.request.rejectedReason,
        adminNote: row.request.adminNote,
        createdAt:
            row.request.createdAt.toISOString(),
        updatedAt:
            row.request.updatedAt.toISOString(),

        user: row.user,

        currentMembership:
            row.currentMembershipPlan,

        requestedMembership:
            row.requestedMembershipPlan,
    };
}

export class AdminUpgradeService {
    /**
     * Return all upgrade requests.
     */
    async findAll() {
        const rows =
            await adminUpgradeRepository.findAll();

        return rows.map((row) =>
            mapUpgradeRequest(
                row as RawUpgradeRow,
            ),
        );
    }

    /**
     * Return one upgrade request.
     */
    async findById(
        id: string,
    ) {
        const row =
            await adminUpgradeRepository.findById(
                undefined,
                id,
            );

        if (!row) {
            throw new Error(
                "Upgrade request not found.",
            );
        }

        return mapUpgradeRequest(
            row as RawUpgradeRow,
        );
    }

    /**
     * Mark an upgrade request as under review.
     */
    async markUnderReview(
        requestId: string,
        adminId: string,
    ) {
        return withTransaction(async (tx) => {
            const request =
                upgradeValidation.ensureUpgradeRequestExists(
                    await upgradeRepository.findById(
                        tx,
                        requestId,
                    ),
                );

            adminUpgradeValidation.ensurePendingRequest(
                request,
            );

            const updatedRequest =
                await upgradeRepository.markUnderReview(
                    tx,
                    request.id,
                    adminId,
                );

            await notificationService.notifyUser(
                tx,
                {
                    userId: request.userId,
                    title:
                        "Upgrade Under Review",
                    message:
                        "Your membership upgrade request is currently under review.",
                    type:
                        NotificationType.UPGRADE,
                    metadata: {
                        upgradeRequestId:
                            request.id,
                    },
                },
            );

            return updatedRequest;
        });
    }

    /**
     * Approve an upgrade request.
     */
    async approve(
        requestId: string,
        adminId: string,
        adminNote?: string,
    ) {
        return withTransaction(async (tx) => {
            const request =
                upgradeValidation.ensureUpgradeRequestExists(
                    await upgradeRepository.findById(
                        tx,
                        requestId,
                    ),
                );

            if (
                request.status !==
                UpgradeRequestStatus.UNDER_REVIEW
            ) {
                throw new UpgradeAlreadyProcessedError();
            }

            const user =
                await userRepository.lockById(
                    tx,
                    request.userId,
                );

            if (!user) {
                throw new Error(
                    "User not found.",
                );
            }

            const wallet =
                await walletService.findByUserId(
                    tx,
                    request.userId,
                );

            const transaction =
                await transactionService.createSystemTransaction(
                    tx,
                    {
                        userId: user.id,
                        walletId: wallet.id,
                        amount: request.amount,
                        balanceBefore:
                            wallet.availableBalance,
                        balanceAfter:
                            wallet.availableBalance,
                        type:
                            TransactionType.PURCHASE,
                        status:
                            TransactionStatus.COMPLETED,
                        reference:
                            request.reference,
                        description:
                            "Membership upgrade approved.",
                        metadata: {
                            upgradeRequestId:
                                request.id,
                        },
                    },
                );

            await userRepository.updateMembership(
                tx,
                user.id,
                request.requestedMembershipPlanId,
                false,
            );

            await commissionService.processMembershipUpgrade(
                tx,
                {
                    buyerId: user.id,
                    membershipPlanId:
                        request.requestedMembershipPlanId,
                    amount: Number(
                        request.amount,
                    ),
                    reference:
                        request.reference,
                },
            );

            const approvedRequest =
                await upgradeRepository.approve(
                    tx,
                    request.id,
                    adminId,
                    transaction.id,
                    adminNote,
                );

            await notificationService.notifyUser(
                tx,
                {
                    userId: request.userId,
                    title:
                        "Upgrade Approved",
                    message:
                        "Congratulations! Your membership upgrade has been approved.",
                    type:
                        NotificationType.UPGRADE,
                    metadata: {
                        upgradeRequestId:
                            request.id,
                        transactionId:
                            transaction.id,
                    },
                },
            );

            return approvedRequest;
        });
    }

    /**
     * Reject an upgrade request.
     */
    async reject(
        requestId: string,
        adminId: string,
        rejectedReason: string,
        adminNote?: string,
    ) {
        return withTransaction(async (tx) => {
            const request =
                upgradeValidation.ensureUpgradeRequestExists(
                    await upgradeRepository.findById(
                        tx,
                        requestId,
                    ),
                );

            if (
                request.status !==
                UpgradeRequestStatus.UNDER_REVIEW
            ) {
                throw new UpgradeAlreadyProcessedError();
            }

            const rejectedRequest =
                await upgradeRepository.reject(
                    tx,
                    request.id,
                    adminId,
                    rejectedReason,
                    adminNote,
                );

            await notificationService.notifyUser(
                tx,
                {
                    userId: request.userId,
                    title:
                        "Upgrade Rejected",
                    message: `Your membership upgrade request was rejected. Reason: ${rejectedReason}`,
                    type:
                        NotificationType.UPGRADE,
                    metadata: {
                        upgradeRequestId:
                            request.id,
                    },
                },
            );

            return rejectedRequest;
        });
    }
}

export const adminUpgradeService =
    new AdminUpgradeService();