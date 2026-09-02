import crypto from "crypto";
import { eq } from "drizzle-orm";

import {
    membershipPlanRepository,
} from "../membership-plan/membershipPlan.repository";

import {
    membershipPlanValidation,
} from "../membership-plan/membershipPlan.validation";

import {
    upgradeRepository,
} from "./upgrade.repository";

import {
    upgradeValidation,
} from "./upgrade.validation";

import {
    CreateUpgradeRequestDto,
} from "./upgradeDto";

import {
    UpgradeAlreadyProcessedError,
} from "./upgrade.errors";

import {
    notificationService,
} from "../notification/notification.service";

import {
    withTransaction,
} from "../../database/transaction/transaction";

import {
    users,
} from "../../database/schema";

import {
    UpgradeRequestStatus,
} from "../../database/enums/upgrade.enum";

import {
    NotificationType,
} from "../../database/enums/notification.enum";

import {
    TransactionStatus,
    TransactionType,
} from "../../database/enums/transaction.enum";

import { db } from "../../database";

import {
    walletService,
} from "../wallet/wallet.service";

import {
    transactionService,
} from "../transaction/transaction.service";


export class UpgradeService {

    /**
     * Generate a unique upgrade reference.
     */
    private generateReference() {
        return `UPG-${Date.now()}-${crypto
            .randomBytes(4)
            .toString("hex")
            .toUpperCase()}`;
    }

    /**
     * Create a new upgrade request.
     *
     * IMPORTANT:
     *
     * The money is NOT spent here.
     *
     * It is moved:
     *
     * AVAILABLE -> HELD
     *
     * This protects the money while the
     * admin reviews the request.
     */
    async requestUpgrade(
        userId: string,
        dto: CreateUpgradeRequestDto,
    ) {
        return withTransaction(
            async (tx) => {

                // ------------------------------------------------
                // 1. Validate payment method.
                // ------------------------------------------------

                upgradeValidation.validatePaymentMethod(
                    dto.paymentMethod,
                );

                // ------------------------------------------------
                // 2. Find authenticated user.
                // ------------------------------------------------

                const [user] =
                    await tx
                        .select()
                        .from(users)
                        .where(
                            eq(
                                users.id,
                                userId,
                            ),
                        )
                        .limit(1);

                if (!user) {
                    throw new Error(
                        "User not found.",
                    );
                }

                if (!user.membershipPlanId) {
                    throw new Error(
                        "User has no membership plan.",
                    );
                }

                // ------------------------------------------------
                // 3. Current membership.
                // ------------------------------------------------

                const currentPlan =
                    membershipPlanValidation
                        .ensureMembershipPlanExists(
                            await membershipPlanRepository.findById(
                                tx,
                                user.membershipPlanId,
                            ),
                        );

                // ------------------------------------------------
                // 4. Requested membership.
                // ------------------------------------------------

                const requestedPlan =
                    membershipPlanValidation
                        .ensureMembershipPlanExists(
                            await membershipPlanRepository.findById(
                                tx,
                                dto.requestedMembershipPlanId,
                            ),
                        );

                // ------------------------------------------------
                // 5. Highest membership.
                // ------------------------------------------------

                const highestPlan =
                    membershipPlanValidation
                        .ensureMembershipPlanExists(
                            await membershipPlanRepository.findHighest(
                                tx,
                            ),
                        );

                membershipPlanValidation
                    .ensureNotHighestPlan(
                        currentPlan,
                        highestPlan,
                    );

                // ------------------------------------------------
                // 6. Validate upgrade direction.
                // ------------------------------------------------

                membershipPlanValidation
                    .ensureUpgradeable(
                        currentPlan,
                        requestedPlan,
                    );

                // ------------------------------------------------
                // 7. Enforce sequential upgrades.
                // ------------------------------------------------

                membershipPlanValidation
                    .ensurePlanSequence(
                        currentPlan,
                        requestedPlan,
                    );

                // ------------------------------------------------
                // 8. Ensure no existing request.
                // ------------------------------------------------

                const requests =
                    await upgradeRepository.findByUser(
                        tx,
                        userId,
                    );

                const pendingRequest =
                    requests.find(
                        (request) =>
                            request.status ===
                                UpgradeRequestStatus.PENDING ||
                            request.status ===
                                UpgradeRequestStatus.UNDER_REVIEW,
                    );

                upgradeValidation
                    .ensureNoPendingRequest(
                        pendingRequest,
                    );

                // ------------------------------------------------
                // 9. Lock the user's wallet.
                // ------------------------------------------------

                const wallet =
                    await walletService.lockByUserId(
                        tx,
                        userId,
                    );

                const amount =
                    Number(
                        requestedPlan.upgradePrice,
                    );

                // ------------------------------------------------
                // 10. Verify available balance.
                // ------------------------------------------------

                const availableBefore =
                    Number(
                        wallet.availableBalance,
                    );

                if (
                    availableBefore <
                    amount
                ) {
                    throw new Error(
                        "Insufficient wallet balance for this upgrade.",
                    );
                }

                // ------------------------------------------------
                // 11. Generate reference.
                // ------------------------------------------------

                const reference =
                    this.generateReference();

                // ------------------------------------------------
                // 12. Create upgrade request.
                // ------------------------------------------------

                const request =
                    await upgradeRepository.create(
                        tx,
                        {
                            userId,

                            currentMembershipPlanId:
                                currentPlan.id,

                            requestedMembershipPlanId:
                                requestedPlan.id,

                            amount:
                                requestedPlan.upgradePrice,

                            paymentMethod:
                                dto.paymentMethod,

                            paymentProof:
                                dto.paymentProof,

                            status:
                                UpgradeRequestStatus.PENDING,

                            reference,

                            metadata:
                                dto.metadata,
                        },
                    );

                // ------------------------------------------------
                // 13. HOLD the money.
                //
                // AVAILABLE -> HELD
                // ------------------------------------------------

                await walletService.holdBalance(
                    tx,
                    userId,
                    amount,
                );

                const availableAfter =
                    availableBefore -
                    amount;

                const heldAfter =
                    Number(
                        wallet.heldBalance,
                    ) + amount;

                // ------------------------------------------------
                // 14. Record HOLD transaction.
                // ------------------------------------------------

                await transactionService
                    .createSystemTransaction(
                        {
                            userId,

                            walletId:
                                wallet.id,

                            amount:
                                amount.toFixed(2),

                            balanceBefore:
                                availableBefore.toFixed(2),

                            balanceAfter:
                                availableAfter.toFixed(2),

                            type:
                                TransactionType.HOLD,

                            status:
                                TransactionStatus.COMPLETED,

                            reference:
                                `${reference}-HOLD`,

                            description:
                                `Funds held for membership upgrade to ${requestedPlan.name}.`,

                            metadata: {
                                direction:
                                    "HOLD",

                                upgradeRequestId:
                                    request.id,

                                upgradeReference:
                                    reference,

                                currentMembershipPlanId:
                                    currentPlan.id,

                                requestedMembershipPlanId:
                                    requestedPlan.id,

                                heldAmount:
                                    amount,

                                heldBalanceAfter:
                                    heldAfter,
                            },
                        },
                        tx,
                    );

                // ------------------------------------------------
                // 15. Notify user.
                // ------------------------------------------------

                await notificationService.notifyUser(
                    tx,
                    {
                        userId,

                        title:
                            "Upgrade Request Submitted",

                        message:
                            `Your upgrade request to ${requestedPlan.name} has been submitted. ₦${amount.toLocaleString(
                                "en-NG",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                },
                            )} has been temporarily held from your wallet pending approval.`,

                        type:
                            NotificationType.UPGRADE,

                        metadata: {
                            upgradeRequestId:
                                request.id,

                            amount,

                            requestedMembershipPlanId:
                                requestedPlan.id,
                        },
                    },
                );

                // ------------------------------------------------
                // 16. Notify admins.
                // ------------------------------------------------

                await notificationService.notifyAdmins(
                    tx,
                    {
                        title:
                            "New Upgrade Request",

                        message:
                            `A new membership upgrade request has been submitted by ${user.phone}.`,

                        type:
                            NotificationType.UPGRADE,

                        metadata: {
                            upgradeRequestId:
                                request.id,

                            userId,

                            amount,

                            requestedMembershipPlanId:
                                requestedPlan.id,
                        },
                    },
                );

                return request;
            },
        );
    }

    /**
     * Cancel a pending upgrade request.
     *
     * Cancellation releases:
     *
     * HELD -> AVAILABLE
     */
    async cancelRequest(
        requestId: string,
        userId: string,
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

                // Ensure ownership.
                upgradeValidation
                    .ensureRequestBelongsToUser(
                        request.userId,
                        userId,
                    );

                // Only pending requests can be cancelled.
                if (
                    request.status !==
                    UpgradeRequestStatus.PENDING
                ) {
                    throw new UpgradeAlreadyProcessedError();
                }

                const amount =
                    Number(request.amount);

                // Lock wallet.
                const wallet =
                    await walletService.lockByUserId(
                        tx,
                        userId,
                    );

                const availableBefore =
                    Number(
                        wallet.availableBalance,
                    );

                // Release held funds.
                await walletService.releaseHeldBalance(
                    tx,
                    userId,
                    amount,
                );

                const availableAfter =
                    availableBefore +
                    amount;

                // Record release transaction.
                await transactionService
                    .createSystemTransaction(
                        {
                            userId,

                            walletId:
                                wallet.id,

                            amount:
                                amount.toFixed(2),

                            balanceBefore:
                                availableBefore.toFixed(2),

                            balanceAfter:
                                availableAfter.toFixed(2),

                            type:
                                TransactionType.RELEASE,

                            status:
                                TransactionStatus.COMPLETED,

                            reference:
                                `${request.reference}-CANCEL`,

                            description:
                                "Upgrade request cancelled. Held funds released back to wallet.",

                            metadata: {
                                direction:
                                    "RELEASE",

                                upgradeRequestId:
                                    request.id,

                                upgradeReference:
                                    request.reference,

                                reason:
                                    "user_cancelled",
                            },
                        },
                        tx,
                    );

                const cancelledRequest =
                    await upgradeRepository.cancel(
                        tx,
                        request.id,
                    );

                if (!cancelledRequest) {
                    throw new Error(
                        "Failed to cancel upgrade request.",
                    );
                }

                await notificationService.notifyUser(
                    tx,
                    {
                        userId,

                        title:
                            "Upgrade Request Cancelled",

                        message:
                            `Your upgrade request has been cancelled and ₦${amount.toLocaleString(
                                "en-NG",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                },
                            )} has been released back to your available wallet balance.`,

                        type:
                            NotificationType.UPGRADE,

                        metadata: {
                            upgradeRequestId:
                                request.id,

                            amount,
                        },
                    },
                );

                return cancelledRequest;
            },
        );
    }

    /**
     * Find one upgrade request.
     */
    async findById(
        id: string,
    ) {
        const request =
            await upgradeRepository.findById(
                db,
                id,
            );

        return upgradeValidation
            .ensureUpgradeRequestExists(
                request,
            );
    }

    /**
     * Return all upgrade requests belonging
     * to a user.
     */
    async findByUser(
        userId: string,
    ) {
        return upgradeRepository.findByUser(
            db,
            userId,
        );
    }

    /**
     * Return pending and under-review
     * upgrade requests.
     */
    async findPending() {
        return upgradeRepository.findPending(
            db,
        );
    }

    /**
     * Validate a potential upgrade.
     */
    async validateUpgrade(
        userId: string,
        requestedMembershipPlanId: string,
    ) {
        const [user] =
            await db
                .select()
                .from(users)
                .where(
                    eq(
                        users.id,
                        userId,
                    ),
                )
                .limit(1);

        if (!user) {
            throw new Error(
                "User not found.",
            );
        }

        if (!user.membershipPlanId) {
            throw new Error(
                "User has no membership plan.",
            );
        }

        const currentPlan =
            membershipPlanValidation
                .ensureMembershipPlanExists(
                    await membershipPlanRepository.findById(
                        db,
                        user.membershipPlanId,
                    ),
                );

        const requestedPlan =
            membershipPlanValidation
                .ensureMembershipPlanExists(
                    await membershipPlanRepository.findById(
                        db,
                        requestedMembershipPlanId,
                    ),
                );

        const highestPlan =
            membershipPlanValidation
                .ensureMembershipPlanExists(
                    await membershipPlanRepository.findHighest(
                        db,
                    ),
                );

        const wallet =
            await walletService.findByUserId(
                db,
                userId,
            );

        const requests =
            await upgradeRepository.findByUser(
                db,
                userId,
            );

        const pendingRequest =
            requests.find(
                (request) =>
                    request.status ===
                        UpgradeRequestStatus.PENDING ||
                    request.status ===
                        UpgradeRequestStatus.UNDER_REVIEW,
            );

        let validMembership = true;
        let sequentialUpgrade = true;
        let noPendingRequest = true;
        let sufficientBalance = true;

        const failedChecks: {
            key: string;
            message: string;
        }[] = [];

        if (
            currentPlan.sortOrder >=
            highestPlan.sortOrder
        ) {
            validMembership = false;

            failedChecks.push({
                key:
                    "highestMembership",

                message:
                    "You are already on the highest membership plan.",
            });
        }

        if (
            requestedPlan.sortOrder <=
            currentPlan.sortOrder
        ) {
            sequentialUpgrade = false;

            failedChecks.push({
                key:
                    "upgradeDirection",

                message:
                    "You can only upgrade to a higher membership plan.",
            });
        }

        if (
            requestedPlan.sortOrder >
                currentPlan.sortOrder &&
            requestedPlan.sortOrder !==
                currentPlan.sortOrder + 1
        ) {
            sequentialUpgrade = false;

            failedChecks.push({
                key:
                    "sequence",

                message:
                    "Membership upgrades must follow the next available plan.",
            });
        }

        if (!requestedPlan.isActive) {
            validMembership = false;

            failedChecks.push({
                key:
                    "inactivePlan",

                message:
                    "This membership plan is currently inactive.",
            });
        }

        if (!requestedPlan.canUpgradeTo) {
            validMembership = false;

            failedChecks.push({
                key:
                    "upgradeDisabled",

                message:
                    "This membership plan cannot currently be upgraded to.",
            });
        }

        if (pendingRequest) {
            noPendingRequest = false;

            failedChecks.push({
                key:
                    "pendingRequest",

                message:
                    "You already have a pending membership upgrade request.",
            });
        }

        const requiredAmount =
            Number(
                requestedPlan.upgradePrice,
            );

        const availableBalance =
            Number(
                wallet.availableBalance,
            );

        if (
            availableBalance <
            requiredAmount
        ) {
            sufficientBalance = false;

            failedChecks.push({
                key:
                    "insufficientBalance",

                message:
                    "You do not have sufficient available wallet balance for this upgrade.",
            });
        }

                const canUpgrade =
            validMembership &&
            sequentialUpgrade &&
            noPendingRequest &&
            sufficientBalance;

        // ------------------------------------------------
        // Build the checks array.
        //
        // IMPORTANT:
        // The frontend expects `checks` as an ARRAY of
        // { key, title, description, passed } objects,
        // not a flat object of booleans.
        // ------------------------------------------------

        const checks: {
            key: string;
            title: string;
            description: string;
            passed: boolean;
        }[] = [
            {
                key: "validMembership",
                title: "Membership eligibility",
                description:
                    "Your current membership plan is eligible to upgrade.",
                passed: validMembership,
            },
            {
                key: "sequentialUpgrade",
                title: "Sequential upgrade path",
                description:
                    "You are upgrading to the next available membership tier.",
                passed: sequentialUpgrade,
            },
            {
                key: "noPendingRequest",
                title: "No pending request",
                description:
                    "You don't have another upgrade request in progress.",
                passed: noPendingRequest,
            },
            {
                key: "sufficientBalance",
                title: "Sufficient wallet balance",
                description:
                    "Your available wallet balance covers the upgrade cost.",
                passed: sufficientBalance,
            },
        ];

        return {
            canUpgrade,

            currentPlan: {
                id:
                    currentPlan.id,

                name:
                    currentPlan.name,

                sortOrder:
                    currentPlan.sortOrder,
            },

            requestedPlan: {
                id:
                    requestedPlan.id,

                name:
                    requestedPlan.name,

                sortOrder:
                    requestedPlan.sortOrder,

                upgradePrice:
                    requestedPlan.upgradePrice,
            },

            wallet: {
                balance:
                    wallet.availableBalance,

                sufficient:
                    sufficientBalance,
            },

            checks,

            failedChecks,

            reason:
                failedChecks.length > 0
                    ? failedChecks
                          .map(
                              (check) =>
                                  check.message,
                          )
                          .join(" ")
                    : null,
        };
    }
}

export const upgradeService =
    new UpgradeService();