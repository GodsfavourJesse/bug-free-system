import {
    CreateCommissionDto,
    ProcessCommissionDto,
} from "./commission.dto";

import { referralService } from "../referral/referral.service";
import { commissionValidation } from "./commission.validation";
import { commissionCalculator } from "./commission.calculator";

import { rewardEngineService } from "../reward-engine/rewardEngine.service";

import { DbExecutor } from "../../database/types/types";
import { db } from "../../database";

import { TransactionType } from "../../database/enums/transaction.enum";
import { NotificationType } from "../../database/enums/notification.enum";

import { COMMISSION_SOURCES } from "../../constants/commision.constants";

export class CommissionService {

    /**
     * Process commissions generated
     * from a product purchase.
     */
    async processPurchase(
        executor: DbExecutor = db,
        dto: ProcessCommissionDto,
    ) {
        return this.process(
            executor,
            dto,
        );
    }

    /**
     * Process commissions generated
     * from a membership upgrade.
     */
    async processMembershipUpgrade(
        executor: DbExecutor = db,
        dto: Omit<
            ProcessCommissionDto,
            "source"
        >,
    ) {
        return this.process(
            executor,
            {
                ...dto,
                source:
                    COMMISSION_SOURCES.MEMBERSHIP_PURCHASE,
            },
        );
    }

    /**
     * Orchestrates commission processing
     * for every eligible upline.
     */
    async process(
        executor: DbExecutor = db,
        dto: ProcessCommissionDto,
    ) {

        // Find every eligible ancestor.
        const ancestors =
            await referralService.getAncestors(
                dto.buyerId,
            );

        if (ancestors.length === 0) {
            return [];
        }

        const payouts: NonNullable<
            Awaited<
                ReturnType<
                    CommissionService["payLevel"]
                >
            >
        >[] = [];

        // Reward each eligible ancestor.
        for (const ancestor of ancestors) {

            const payout =
                await this.payLevel(
                    executor,
                    {
                        recipientId:
                            ancestor.user.id,

                        buyerId:
                            dto.buyerId,

                        membershipPlanId:
                            dto.membershipPlanId,

                        level:
                            ancestor.level as
                                | 1
                                | 2
                                | 3,

                        amount:
                            dto.amount,

                        reference:
                            dto.reference,

                        source:
                            dto.source,
                    },
                );

            if (payout) {
                payouts.push(
                    payout,
                );
            }
        }

        return payouts;
    }

    /**
     * Reward one referral level.
     */
    private async payLevel(
        executor: DbExecutor,
        dto: CreateCommissionDto,
    ) {

        commissionValidation.ensureEligibleLevel(
            dto.level,
        );

        const commissionAmount =
            commissionCalculator.calculateByLevel(
                dto.amount,
                dto.level,
            );

        if (commissionAmount <= 0) {
            return null;
        }

        const reward =
            await rewardEngineService.creditReward(
                executor,
                {
                    userId:
                        dto.recipientId,

                    amount:
                        commissionAmount,

                    type:
                        TransactionType.COMMISSION,

                    description:
                        `Referral commission (Level ${dto.level})`,

                    notification: {
                        title:
                            "Commission Received",

                        message:
                            `You've received ₦${commissionAmount.toLocaleString(
                                "en-NG",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                },
                            )} as a Level ${dto.level} referral commission.`,
                        type:
                            NotificationType.COMMISSION,
                    },

                    metadata: {
                        buyerId:
                            dto.buyerId,

                        membershipPlanId:
                            dto.membershipPlanId,

                        purchaseReference:
                            dto.reference,

                        referralLevel:
                            dto.level,

                        commissionAmount,

                        source:
                            dto.source,
                    },
                },
            );

        return {
            recipientId:
                dto.recipientId,

            buyerId:
                dto.buyerId,

            level:
                dto.level,

            commission:
                commissionAmount,

            walletId:
                reward.walletId,

            transactionId:
                reward.transactionId,

            reference:
                reward.reference,
        };
    }
}

export const commissionService =
    new CommissionService();