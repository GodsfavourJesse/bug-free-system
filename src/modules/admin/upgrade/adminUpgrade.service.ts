import { NotificationType } from "../../../database/enums/notification.enum";

import {
    TransactionStatus,
    TransactionType,
} from "../../../database/enums/transaction.enum";

import {
    UpgradeRequestStatus,
} from "../../../database/enums/upgrade.enum";

import {
    AdminWalletTransactionType,
} from "../../../database/enums/admin-wallet-transaction.enum";

import {
    withTransaction,
} from "../../../database/transaction/transaction";

import {
    commissionService,
} from "../../commission/commission.service";

import {
    notificationService,
} from "../../notification/notification.service";

import {
    transactionService,
} from "../../transaction/transaction.service";

import {
    UpgradeAlreadyProcessedError,
} from "../../upgrade/upgrade.errors";

import {
    upgradeRepository,
} from "../../upgrade/upgrade.repository";

import {
    upgradeValidation,
} from "../../upgrade/upgrade.validation";

import {
    userRepository,
} from "../../user/user.repository";

import {
    walletService,
} from "../../wallet/wallet.service";

import {
    walletValidation,
} from "../../wallet/wallet.validation";

import {
    adminUpgradeRepository,
} from "./adminUpgrade.repository";

import {
    adminUpgradeValidation,
} from "./adminUpgrade.validation";

import {
    adminWalletService,
} from "../admin-wallet/adminWallet.service";

import {
    adminWalletTransactionRepository,
} from "../admin-wallet/admin-wallet-transaction/adminWalletTransaction.repository";


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

        metadata:
            Record<string, unknown> | null;

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
        id:
            row.request.id,

        amount:
            row.request.amount,

        paymentMethod:
            row.request.paymentMethod,

        paymentProof:
            row.request.paymentProof,

        reference:
            row.request.reference,

        status:
            row.request.status,

        metadata:
            row.request.metadata,

        transactionId:
            row.request.transactionId,

        reviewedBy:
            row.request.reviewedBy,

        reviewedAt:
            row.request.reviewedAt
                ?.toISOString() ?? null,

        rejectedReason:
            row.request.rejectedReason,

        adminNote:
            row.request.adminNote,

        createdAt:
            row.request.createdAt.toISOString(),

        updatedAt:
            row.request.updatedAt.toISOString(),

        user:
            row.user,

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

        return rows.map(
            (row) =>
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
     * Mark an upgrade request as
     * UNDER_REVIEW.
     */
    async markUnderReview(
        requestId: string,
        adminId: string,
    ) {
        return withTransaction(
            async (tx) => {

                const request =
                    upgradeValidation
                        .ensureUpgradeRequestExists(
                            await upgradeRepository.findById(
                                tx,
                                requestId,
                            ),
                        );

                adminUpgradeValidation
                    .ensurePendingRequest(
                        request,
                    );

                const updatedRequest =
                    await upgradeRepository
                        .markUnderReview(
                            tx,
                            request.id,
                            adminId,
                        );

                if (!updatedRequest) {
                    throw new Error(
                        "Failed to mark upgrade request as under review.",
                    );
                }

                await notificationService
                    .notifyUser(
                        tx,
                        {
                            userId:
                                request.userId,

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
            },
        );
    }

    /**
     * APPROVE an upgrade request.
     *
     * IMPORTANT FLOW:
     *
     * HELD USER MONEY
     *       ↓
     *      ADMIN
     *
     * At approval:
     *
     * 1. Lock user.
     * 2. Lock user wallet.
     * 3. Verify held money.
     * 4. Remove money from held balance.
     * 5. Credit admin wallet.
     * 6. Create user DEBIT transaction.
     * 7. Create admin CREDIT transaction.
     * 8. Update membership.
     * 9. Pay referral commissions.
     * 10. Mark request APPROVED.
     * 11. Notify user.
     */
    async approve(
        requestId: string,
        adminId: string,
        adminNote?: string,
    ) {
        return withTransaction(
            async (tx) => {

                // --------------------------------------------
                // 1. Get request.
                // --------------------------------------------

                const request =
                    upgradeValidation
                        .ensureUpgradeRequestExists(
                            await upgradeRepository.findById(
                                tx,
                                requestId,
                            ),
                        );

                // --------------------------------------------
                // 2. Only UNDER_REVIEW can be approved.
                // --------------------------------------------

                if (
                    request.status !==
                    UpgradeRequestStatus.UNDER_REVIEW
                ) {
                    throw new UpgradeAlreadyProcessedError();
                }

                // --------------------------------------------
                // 3. Lock user.
                // --------------------------------------------

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

                // --------------------------------------------
                // 4. Lock user's wallet.
                // --------------------------------------------

                const wallet =
                    await walletService.lockByUserId(
                        tx,
                        request.userId,
                    );

                const amount =
                    Number(
                        request.amount,
                    );

                const availableBefore =
                    Number(
                        wallet.availableBalance,
                    );

                const heldBefore =
                    Number(
                        wallet.heldBalance,
                    );

                // --------------------------------------------
                // 5. Verify the money is held.
                // --------------------------------------------

                walletValidation
                    .ensureHeldBalance(
                        heldBefore,
                        amount,
                    );

                // --------------------------------------------
                // 6. Consume the held money.
                //
                // AVAILABLE remains unchanged.
                // HELD becomes zero/reduced.
                // --------------------------------------------

                await walletService
                    .completeHeldPayment(
                        tx,
                        request.userId,
                        amount,
                    );

                const heldAfter =
                    heldBefore -
                    amount;

                // --------------------------------------------
                // 7. Credit ADMIN wallet.
                // --------------------------------------------

                const adminCredit =
                    await adminWalletService.credit(
                        tx,
                        amount,
                    );

                // --------------------------------------------
                // 8. Create USER debit transaction.
                // --------------------------------------------

                const userTransaction =
                    await transactionService
                        .createSystemTransaction(
                            {
                                userId:
                                    user.id,

                                walletId:
                                    wallet.id,

                                amount:
                                    amount.toFixed(2),

                                balanceBefore:
                                    availableBefore.toFixed(
                                        2,
                                    ),

                                balanceAfter:
                                    availableBefore.toFixed(
                                        2,
                                    ),

                                type:
                                    TransactionType.PURCHASE,

                                status:
                                    TransactionStatus.COMPLETED,

                                reference:
                                    request.reference,

                                description:
                                    "Membership upgrade payment.",

                                metadata: {
                                    direction:
                                        "DEBIT",

                                    upgradeRequestId:
                                        request.id,

                                    upgradeReference:
                                        request.reference,

                                    currentMembershipPlanId:
                                        request.currentMembershipPlanId,

                                    requestedMembershipPlanId:
                                        request.requestedMembershipPlanId,

                                    amount,

                                    heldBalanceBefore:
                                        heldBefore,

                                    heldBalanceAfter:
                                        heldAfter,
                                },
                            },

                            tx,
                        );

                // --------------------------------------------
                // 9. Create ADMIN credit transaction.
                // --------------------------------------------

                await adminWalletTransactionRepository
                    .create(
                        tx,
                        {
                            adminId:
                                adminCredit.userId,

                            type:
                                AdminWalletTransactionType
                                    .UPGRADE_PAYMENT_CREDIT,

                            amount:
                                amount.toFixed(2),

                            balanceBefore:
                                adminCredit.balanceBefore.toFixed(
                                    2,
                                ),

                            balanceAfter:
                                adminCredit.balanceAfter.toFixed(
                                    2,
                                ),

                            description:
                                `Membership upgrade payment received from user ${user.id}.`,

                            metadata: {
                                direction:
                                    "CREDIT",

                                upgradeRequestId:
                                    request.id,

                                upgradeReference:
                                    request.reference,

                                userId:
                                    user.id,

                                userTransactionId:
                                    userTransaction.id,

                                requestedMembershipPlanId:
                                    request.requestedMembershipPlanId,
                            },
                        },
                    );

                // --------------------------------------------
                // 10. UPDATE USER MEMBERSHIP.
                // --------------------------------------------

                const updatedUser =
                    await userRepository
                        .updateMembership(
                            tx,
                            user.id,
                            request.requestedMembershipPlanId,
                            true,
                        );

                if (!updatedUser) {
                    throw new Error(
                        "Failed to update user membership.",
                    );
                }

                // --------------------------------------------
                // 11. Pay referral commissions.
                //
                // These commissions come FROM THE
                // ADMIN WALLET.
                // --------------------------------------------

                await commissionService
                    .processMembershipUpgrade(
                        tx,
                        {
                            buyerId:
                                user.id,

                            membershipPlanId:
                                request.requestedMembershipPlanId,

                            amount,

                            reference:
                                request.reference,
                        },
                    );

                // --------------------------------------------
                // 12. Mark request APPROVED.
                // --------------------------------------------

                const approvedRequest =
                    await upgradeRepository.approve(
                        tx,
                        request.id,
                        adminId,
                        userTransaction.id,
                        adminNote,
                    );

                if (!approvedRequest) {
                    throw new Error(
                        "Failed to approve upgrade request.",
                    );
                }

                // --------------------------------------------
                // 13. Notify user.
                // --------------------------------------------

                await notificationService
                    .notifyUser(
                        tx,
                        {
                            userId:
                                request.userId,

                            title:
                                "Upgrade Approved",

                            message:
                                "Congratulations! Your membership upgrade has been approved and your membership has been updated successfully.",

                            type:
                                NotificationType.UPGRADE,

                            metadata: {
                                upgradeRequestId:
                                    request.id,

                                transactionId:
                                    userTransaction.id,

                                membershipPlanId:
                                    request.requestedMembershipPlanId,

                                amount,
                            },
                        },
                    );

                return approvedRequest;
            },
        );
    }

    /**
     * REJECT an upgrade request.
     *
     * HELD -> AVAILABLE
     */
    async reject(
        requestId: string,
        adminId: string,
        rejectedReason: string,
        adminNote?: string,
    ) {
        return withTransaction(
            async (tx) => {

                const request =
                    upgradeValidation
                        .ensureUpgradeRequestExists(
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

                const amount =
                    Number(
                        request.amount,
                    );

                // --------------------------------------------
                // Lock wallet.
                // --------------------------------------------

                const wallet =
                    await walletService.lockByUserId(
                        tx,
                        request.userId,
                    );

                const availableBefore =
                    Number(
                        wallet.availableBalance,
                    );

                const heldBefore =
                    Number(
                        wallet.heldBalance,
                    );

                walletValidation
                    .ensureHeldBalance(
                        heldBefore,
                        amount,
                    );

                // --------------------------------------------
                // Release funds.
                //
                // HELD -> AVAILABLE
                // --------------------------------------------

                await walletService
                    .releaseHeldBalance(
                        tx,
                        request.userId,
                        amount,
                    );

                const availableAfter =
                    availableBefore +
                    amount;

                // --------------------------------------------
                // Record release transaction.
                // --------------------------------------------

                await transactionService
                    .createSystemTransaction(
                        {
                            userId:
                                request.userId,

                            walletId:
                                wallet.id,

                            amount:
                                amount.toFixed(2),

                            balanceBefore:
                                availableBefore.toFixed(
                                    2,
                                ),

                            balanceAfter:
                                availableAfter.toFixed(
                                    2,
                                ),

                            type:
                                TransactionType.RELEASE,

                            status:
                                TransactionStatus.COMPLETED,

                            reference:
                                `${request.reference}-RELEASE`,

                            description:
                                "Membership upgrade rejected. Held funds released back to wallet.",

                            metadata: {
                                direction:
                                    "RELEASE",

                                upgradeRequestId:
                                    request.id,

                                upgradeReference:
                                    request.reference,

                                reason:
                                    "admin_rejected",
                            },
                        },

                        tx,
                    );

                // --------------------------------------------
                // Mark request rejected.
                // --------------------------------------------

                const rejectedRequest =
                    await upgradeRepository.reject(
                        tx,
                        request.id,
                        adminId,
                        rejectedReason,
                        adminNote,
                    );

                if (!rejectedRequest) {
                    throw new Error(
                        "Failed to reject upgrade request.",
                    );
                }

                // --------------------------------------------
                // Notify user.
                // --------------------------------------------

                await notificationService
                    .notifyUser(
                        tx,
                        {
                            userId:
                                request.userId,

                            title:
                                "Upgrade Rejected",

                            message:
                                `Your membership upgrade request was rejected. Reason: ${rejectedReason}. Your held funds have been released back to your available wallet balance.`,

                            type:
                                NotificationType.UPGRADE,

                            metadata: {
                                upgradeRequestId:
                                    request.id,

                                amount,

                                rejectedReason,
                            },
                        },
                    );

                return rejectedRequest;
            },
        );
    }
}

export const adminUpgradeService =
    new AdminUpgradeService();