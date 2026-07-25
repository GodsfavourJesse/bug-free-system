import crypto from "crypto";
import { eq } from "drizzle-orm";

import { db } from "@/database";
import { withTransaction } from "@/database/transaction/transaction";

import { users } from "@/database/schema";

import { UpgradeRequestStatus } from "@/database/enums/upgrade.enum";

import { membershipPlanRepository } from "../membership-plan/memebershpPlan.repository";
import { membershipPlanValidation } from "../membership-plan/membershipPlan.validation";

import { upgradeRepository } from "./upgrade.repository";
import { upgradeValidation } from "./upgrade.validation";

import { CreateUpgradeRequestDto } from "./upgradeDto";
import { UpgradeAlreadyProcessedError } from "./upgrade.errors";
import { notificationService } from "../notification/notification.service";
import { NotificationType } from "@/database/enums/notification.enum";

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
}

export const upgradeService =
    new UpgradeService();