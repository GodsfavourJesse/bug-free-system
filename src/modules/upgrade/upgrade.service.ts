import crypto from "crypto";
import { eq } from "drizzle-orm";

import { membershipPlanRepository } from "../membership-plan/membershipPlan.repository";
import { membershipPlanValidation } from "../membership-plan/membershipPlan.validation";

import { upgradeRepository } from "./upgrade.repository";
import { upgradeValidation } from "./upgrade.validation";

import { CreateUpgradeRequestDto } from "./upgradeDto";
import { UpgradeAlreadyProcessedError } from "./upgrade.errors";
import { notificationService } from "../notification/notification.service";
import { withTransaction } from "../../database/transaction/transaction";
import { users } from "../../database/schema";
import { UpgradeRequestStatus } from "../../database/enums/upgrade.enum";
import { NotificationType } from "../../database/enums/notification.enum";
import { db } from "../../database";
import { walletService } from "../wallet/wallet.service";


export class UpgradeService {

    // Generate a unique upgrade reference.
    private generateReference() {
        return `UPG-${Date.now()}-${crypto
            .randomBytes(4)
            .toString("hex")
            .toUpperCase()}`;
    }

    // Create a new upgrade request.
    async requestUpgrade(
        userId: string,
        dto: CreateUpgradeRequestDto,
    ) {
        return withTransaction(async (tx) => {

            // Validate payment method.
            upgradeValidation.validatePaymentMethod(
                dto.paymentMethod,
            );

            // Find authenticated user.
            const [user] = await tx
                .select()
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);

            if (!user) {
                throw new Error("User not found.");
            }

            if (!user.membershipPlanId) {
                throw new Error(
                    "User has no membership plan.",
                );
            }

            // Find the user's current membership plan.
            const currentPlan =
                membershipPlanValidation.ensureMembershipPlanExists(
                    await membershipPlanRepository.findById(
                        tx,
                        user.membershipPlanId,
                    ),
                );

            // Find the requested membership plan.
            const requestedPlan =
                membershipPlanValidation.ensureMembershipPlanExists(
                    await membershipPlanRepository.findById(
                        tx,
                        dto.requestedMembershipPlanId,
                    ),
                );

            // Ensure the user isn't already on the highest plan.
            const highestPlan =
                membershipPlanValidation.ensureMembershipPlanExists(
                    await membershipPlanRepository.findHighest(
                        tx,
                    ),
                );

            membershipPlanValidation.ensureNotHighestPlan(
                currentPlan,
                highestPlan,
            );

            // Ensure the requested plan can be upgraded to.
            membershipPlanValidation.ensureUpgradeable(
                currentPlan,
                requestedPlan,
            );

            // Ensure upgrades happen sequentially.
            membershipPlanValidation.ensurePlanSequence(
                currentPlan,
                requestedPlan,
            );

            // Ensure the user has no pending request.
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

            upgradeValidation.ensureNoPendingRequest(
                pendingRequest,
            );

            // Create the upgrade request.
            const request = await upgradeRepository.create(tx, {
                userId,

                currentMembershipPlanId: currentPlan.id,

                requestedMembershipPlanId: requestedPlan.id,

                amount: requestedPlan.upgradePrice,

                paymentMethod: dto.paymentMethod,

                paymentProof: dto.paymentProof,

                status: UpgradeRequestStatus.PENDING,

                reference: this.generateReference(),

                metadata: dto.metadata,
            });

            // Notify the user.
            await notificationService.notifyUser(tx, {
                userId,
                title: "Upgrade Request Submitted",
                message:
                    "Your membership upgrade request has been submitted successfully and is awaiting review.",
                type: NotificationType.UPGRADE,
                metadata: {
                    upgradeRequestId: request.id,
                },
            });

            // Notify every admin.
            await notificationService.notifyAdmins(tx, {
                title: "New Upgrade Request",
                message:
                    `A new upgrade request has been submitted by ${user.phone}.`,
                type: NotificationType.UPGRADE,
                metadata: {
                    upgradeRequestId: request.id,
                },
            });

            return request;
        });
    }

    // Cancel a pending upgrade request.
    async cancelRequest(
        requestId: string,
        userId: string,
    ) {
        return withTransaction(async (tx) => {

            const request =
                upgradeValidation.ensureUpgradeRequestExists(
                    await upgradeRepository.findById(
                        tx,
                        requestId,
                    ),
                );

            // Ensure the request belongs to the user.
            upgradeValidation.ensureRequestBelongsToUser(
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

            return upgradeRepository.cancel(
                tx,
                request.id,
            );
        });
    }

    // Find a single upgrade request.
    async findById(
        id: string,
    ) {
        const request =
            await upgradeRepository.findById(
                db,
                id,
            );

        return upgradeValidation.ensureUpgradeRequestExists(
            request,
        );
    }

    // Return every upgrade request belonging to a user.
    async findByUser(
        userId: string,
    ) {
        return upgradeRepository.findByUser(
            db,
            userId,
        );
    }

    // Return every pending upgrade request.
    async findPending() {
        return upgradeRepository.findPending(
            db,
        );
    }

    async validateUpgrade(
        userId: string,
        requestedMembershipPlanId: string,
    ) {
        // Find authenticated user
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!user) {
            throw new Error("User not found.");
        }

        if (!user.membershipPlanId) {
            throw new Error(
                "User has no membership plan.",
            );
        }

        // Current membership
        const currentPlan = membershipPlanValidation.ensureMembershipPlanExists(
            await membershipPlanRepository.findById(
                db,
                user.membershipPlanId,
            ),
        );

        // Requested membership
        const requestedPlan = membershipPlanValidation.ensureMembershipPlanExists(
            await membershipPlanRepository.findById(
                db,
                requestedMembershipPlanId,
            ),
        );

        // Highest membership
        const highestPlan = membershipPlanValidation.ensureMembershipPlanExists(
            await membershipPlanRepository.findHighest(
                db,
            ),
        );

        // Wallet
        const wallet = await walletService.findByUserId(
            db,
            userId,
        );

        if (!wallet) {
            throw new Error(
                "Wallet not found.",
            );
        }

        // Existing pending request
        const requests = await upgradeRepository.findByUser(
            db,
            userId,
        );

        const pendingRequest = requests.find(
            (request) =>
                request.status ===
                    UpgradeRequestStatus.PENDING ||
                request.status ===
                    UpgradeRequestStatus.UNDER_REVIEW,
        );

        // Perform validations
        let validMembership = true;
        let sequentialUpgrade = true;
        let noPendingRequest = true;
        let sufficientBalance = true;

        const failedChecks: {
            key: string;
            message: string;
        }[] = [];

        // Already highest
        if (
            currentPlan.sortOrder >=
            highestPlan.sortOrder
        ) {
            validMembership = false;

            failedChecks.push({
                key: "highestMembership",
                message: "You are already on the highest membership plan.",
            });
        }

        // Requested plan must be above current
        if (
            requestedPlan.sortOrder <=
            currentPlan.sortOrder
        ) {
            sequentialUpgrade = false;

            failedChecks.push({
                key: "upgradeDirection",
                message: "You can only upgrade to a higher membership plan.",
            });
        }

        // Sequential upgrade
        if (
            requestedPlan.sortOrder >
                currentPlan.sortOrder &&
            requestedPlan.sortOrder !==
                currentPlan.sortOrder + 1
        ) {
            sequentialUpgrade = false;

            failedChecks.push({
                key: "sequence",
                message: "Membership upgrades must follow the next available plan.",
            });
        }

        // Plan must be active
        if (!requestedPlan.isActive) {
            validMembership = false;

            failedChecks.push({
                key: "inactivePlan",
                message: "This membership plan is currently inactive.",
            });
        }

        // Plan must allow upgrades
        if (!requestedPlan.canUpgradeTo) {
            validMembership = false;

            failedChecks.push({
                key: "upgradeDisabled",
                message: "This membership plan cannot currently be upgraded to.",
            });
        }

        // Pending request
        if (pendingRequest) {
            noPendingRequest = false;

            failedChecks.push({
                key: "pendingRequest",
                message: "You already have a pending upgrade request.",
            });
        }

        // Wallet balance
        if (
            Number(wallet.availableBalance) <
            Number(requestedPlan.upgradePrice)
        ) {
            sufficientBalance = false;

            failedChecks.push({
                key: "wallet",
                message: "Insufficient wallet balance.",
            });
        }

        const canUpgrade =
            validMembership &&
            sequentialUpgrade &&
            noPendingRequest &&
            sufficientBalance;

        return {
            canUpgrade,

            currentPlan: {
                id: currentPlan.id,
                name: currentPlan.name,
                sortOrder: currentPlan.sortOrder,
            },

            requestedPlan: {
                id: requestedPlan.id,
                name: requestedPlan.name,
                sortOrder: requestedPlan.sortOrder,
                upgradePrice: requestedPlan.upgradePrice,
            },

            wallet: {
                balance: wallet.availableBalance,
                required: requestedPlan.upgradePrice,
                sufficient: sufficientBalance,
            },

            checks: [
            {
                key: "membership",
                title: "Membership Eligible",
                description:
                    "Your current membership can be upgraded.",
                passed: validMembership,
            },
            {
                key: "sequence",
                title: "Upgrade Path",
                description:
                    "You're upgrading to the next membership level.",
                passed: sequentialUpgrade,
            },
            {
                key: "wallet",
                title: "Wallet Balance",
                description:
                    "Your wallet contains enough balance.",
                passed: sufficientBalance,
            },
            {
                key: "pending",
                title: "Pending Request",
                description:
                    "No upgrade request is awaiting approval.",
                passed: noPendingRequest,
            },
        ],

            failedChecks,
        };
    }
}

export const upgradeService =
    new UpgradeService();