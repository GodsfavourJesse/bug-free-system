import { DbExecutor } from "../../database/types/types";

import {
    CreditRewardDto,
    RewardResultDto,
    ProcessCompletionDto,
} from "./rewardEngine.dto";

import { rewardEngineValidation } from "./rewardEngine.validation";

import { walletService } from "../wallet/wallet.service";
import { transactionService } from "../transaction/transaction.service";
import { notificationService } from "../notification/notification.service";

import { TransactionStatus } from "../../database/enums/transaction.enum";
import { withTransaction } from "../../database/transaction/transaction";
import { completedAdvertisementService } from "../completed-advertisement/completedAdvertisement.service";
import { membershipPlanService } from "../membership-plan/membershipPlan.service";
import { dailyOrderConfigService } from "../admin/daily-order-config/dailyOrderConfig.service";
import { advertisementRepository } from "../admin/advertisement/advertisement.repository";
import { commissionService } from "../commission/commission.service";
import { NotificationType } from "../../database/enums/notification.enum";
import { TransactionType } from "../../database/enums/transaction.enum";


export class RewardEngineService {

    async processCompletion(
        dto: ProcessCompletionDto,
    ) {

        return withTransaction(
            async (tx) => {

                // Resolve membership.
                const membership =
                    await membershipPlanService.getCurrentPlan(
                        dto.userId,
                    );

                const rewardAmount =
                    await dailyOrderConfigService.getRewardForMembership(
                        membership.id,
                    );

                const dailyLimit =
                    await dailyOrderConfigService.getDailyLimit(
                        membership.id,
                    );

                const completedToday =
                    await completedAdvertisementService.countCompletedToday(
                        tx,
                        dto.userId,
                    );

                rewardEngineValidation.ensureDailyLimitNotReached(
                    completedToday,
                    dailyLimit,
                );

                // Credit reward.
                const reward =
                    await this.creditReward(
                        tx,
                        {
                            userId:
                                dto.userId,

                            amount: rewardAmount,

                            type:
                                TransactionType.ORDER_REWARD,

                            description:
                                "Advertisement completion reward.",

                            notification: {
                                title:
                                    "Reward Received",

                                message:
                                    `You earned ₦${rewardAmount} for completing an advertisement.`,

                                type:
                                    NotificationType.ORDER_REWARD,
                            },

                            metadata: {
                                advertisementId:
                                    dto.advertisementId,

                                membershipPlanId:
                                    membership.id,
                            },
                        },
                    );

                /**
                 * 5.
                 * Increment statistics.
                 */
                await advertisementRepository.incrementCompletions(
                    tx,
                    dto.advertisementId,
                );

                /**
                 * 6.
                 * Referral commission.
                 *
                 * (Temporary stub.)
                 */
                // await commissionService.processPurchase(...);

                return reward;
            },
        );
    }

    /**
     * Credits a reward to a user's wallet.
     *
     * Used by:
     * - Daily Orders
     * - Product Completion
     * - Referral Rewards
     * - Signup Bonuses
     * - Cashback
     * - Future Promotions
     */
    async creditReward(
        executor: DbExecutor,
        dto: CreditRewardDto,
    ): Promise<RewardResultDto> {

        /**
         * Step 1
         * Validate request.
         */
        rewardEngineValidation.ensureUserId(
            dto.userId,
        );

        rewardEngineValidation.ensurePositiveAmount(
            dto.amount,
        );

        rewardEngineValidation.ensureValidTransactionType(
            dto.type,
        );

        /**
         * Generate a single reference for the
         * entire reward operation.
         */
        const reference =
            transactionService.generateReference();

        /**
         * Step 2
         * Find wallet.
         */
        const wallet =
            await walletService.findByUserId(
                executor,
                dto.userId,
            );

        rewardEngineValidation.ensureWalletExists(
            wallet,
        );

        const balanceBefore =
            Number(wallet.availableBalance);

        /**
         * Step 3
         * Credit wallet.
         */
        await walletService.credit(
            executor,
            dto.userId,
            dto.amount,
        );

        /**
         * Reload wallet after credit.
         */
        const updatedWallet =
            await walletService.findByUserId(
                executor,
                dto.userId,
            );

        rewardEngineValidation.ensureWalletExists(
            updatedWallet,
        );

        const balanceAfter =
            Number(
                updatedWallet.availableBalance,
            );

        /**
         * Step 4
         * Create transaction.
         */
        const transaction =
            await transactionService.createSystemTransaction(
                executor,
                {
                    userId:
                        dto.userId,

                    walletId:
                        updatedWallet.id,

                    amount:
                        dto.amount.toFixed(2),

                    balanceBefore:
                        balanceBefore.toFixed(2),

                    balanceAfter:
                        balanceAfter.toFixed(2),

                    type:
                        dto.type,

                    status:
                        TransactionStatus.COMPLETED,

                    reference,

                    description:
                        dto.description,

                    metadata:
                        dto.metadata,
                },
            );

        /**
         * Step 5
         * Notify user.
         */
        await notificationService.notifyUser(
            executor,
            {
                userId:
                    dto.userId,

                title:
                    dto.notification.title,

                message:
                    dto.notification.message,

                type:
                    dto.notification.type,

                metadata: {
                    amount:
                        dto.amount,

                    transactionType:
                        dto.type,

                    reference,

                    ...dto.metadata,
                },
            },
        );

        /**
         * Step 6
         * Return standardized response.
         */
        return {
            success: true,

            userId:
                dto.userId,

            walletId:
                updatedWallet.id,

            transactionId:
                transaction.id,

            amount:
                dto.amount,

            balanceBefore,

            balanceAfter,

            reference,

            status:
                transaction.status,
        };
    }
}

export const rewardEngineService =
    new RewardEngineService();