import { DbExecutor } from "../../database/types/types";

import {
    CreditRewardDto,
    RewardResultDto,
    ProcessCompletionDto,
} from "./rewardEngine.dto";

import {
    rewardEngineValidation,
} from "./rewardEngine.validation";

import {
    walletService,
} from "../wallet/wallet.service";

import {
    transactionService,
} from "../transaction/transaction.service";

import {
    notificationService,
} from "../notification/notification.service";

import {
    TransactionStatus,
    TransactionType,
} from "../../database/enums/transaction.enum";

import {
    withTransaction,
} from "../../database/transaction/transaction";

import {
    completedAdvertisementService,
} from "../completed-advertisement/completedAdvertisement.service";

import {
    membershipPlanService,
} from "../membership-plan/membershipPlan.service";

import {
    dailyOrderConfigService,
} from "../admin/daily-order-config/dailyOrderConfig.service";

import {
    advertisementRepository,
} from "../admin/advertisement/advertisement.repository";

import {
    NotificationType,
} from "../../database/enums/notification.enum";

import {
    adminWalletService,
} from "../admin/admin-wallet/adminWallet.service";

import {
    adminWalletTransactionRepository,
} from "../admin/admin-wallet/admin-wallet-transaction/adminWalletTransaction.repository";

import {
    AdminWalletTransactionType,
} from "../../database/enums/admin-wallet-transaction.enum";


export class RewardEngineService {

    /**
     * Process daily advertisement completion.
     */
    async processCompletion(
        dto: ProcessCompletionDto,
    ) {
        return withTransaction(
            async (tx) => {

                // Resolve membership.
                const membership =
                    await membershipPlanService
                        .getCurrentPlan(
                            dto.userId,
                        );

                const rewardAmount =
                    await dailyOrderConfigService
                        .getRewardForMembership(
                            membership.id,
                        );

                const dailyLimit =
                    await dailyOrderConfigService
                        .getDailyLimit(
                            membership.id,
                        );

                const completedToday =
                    await completedAdvertisementService
                        .countCompletedToday(
                            tx,
                            dto.userId,
                        );

                rewardEngineValidation
                    .ensureDailyLimitNotReached(
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

                            amount:
                                rewardAmount,

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

                // Increment advertisement statistics.
                await advertisementRepository
                    .incrementCompletions(
                        tx,
                        dto.advertisementId,
                    );

                return reward;
            },
        );
    }

    /**
     * Credit a reward from the platform.
     *
     * Used by:
     * - Daily Orders
     * - Product Completion
     * - Signup Bonuses
     * - Cashback
     * - Promotions
     */
    async creditReward(
        executor: DbExecutor,
        dto: CreditRewardDto,
    ): Promise<RewardResultDto> {

        rewardEngineValidation.ensureUserId(
            dto.userId,
        );

        rewardEngineValidation
            .ensurePositiveAmount(
                dto.amount,
            );

        rewardEngineValidation
            .ensureValidTransactionType(
                dto.type,
            );

        const reference =
            transactionService.generateReference();

        // --------------------------------------------
        // Find wallet.
        // --------------------------------------------

        const wallet =
            await walletService.findByUserId(
                executor,
                dto.userId,
            );

        rewardEngineValidation
            .ensureWalletExists(
                wallet,
            );

        const balanceBefore =
            Number(
                wallet.availableBalance,
            );

        // --------------------------------------------
        // Credit wallet.
        // --------------------------------------------

        await walletService.credit(
            executor,
            dto.userId,
            dto.amount,
        );

        // Reload wallet.
        const updatedWallet =
            await walletService.findByUserId(
                executor,
                dto.userId,
            );

        rewardEngineValidation
            .ensureWalletExists(
                updatedWallet,
            );

        const balanceAfter =
            Number(
                updatedWallet.availableBalance,
            );

        // --------------------------------------------
        // IMPORTANT:
        //
        // DTO comes FIRST.
        // executor comes SECOND.
        // --------------------------------------------

        const transaction =
            await transactionService
                .createSystemTransaction(
                    {
                        userId:
                            dto.userId,

                        walletId:
                            updatedWallet.id,

                        amount:
                            dto.amount.toFixed(2),

                        balanceBefore:
                            balanceBefore.toFixed(
                                2,
                            ),

                        balanceAfter:
                            balanceAfter.toFixed(
                                2,
                            ),

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

                    executor,
                );

        // --------------------------------------------
        // Notify user.
        // --------------------------------------------

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

    /**
     * Credit a funded reward.
     *
     * The money comes from the ADMIN wallet
     * and is credited to the recipient wallet.
     *
     * Used for referral commissions.
     */
    async creditFundedReward(
        executor: DbExecutor,
        dto: CreditRewardDto,
    ) {
        rewardEngineValidation.ensureUserId(
            dto.userId,
        );

        rewardEngineValidation
            .ensurePositiveAmount(
                dto.amount,
            );

        rewardEngineValidation
            .ensureValidTransactionType(
                dto.type,
            );

        const reference =
            transactionService.generateReference();

        // --------------------------------------------
        // 1. Debit ADMIN wallet.
        // --------------------------------------------

        const adminDebit =
            await adminWalletService.debit(
                executor,
                dto.amount,
            );

        // --------------------------------------------
        // 2. Record admin wallet transaction.
        // --------------------------------------------

        await adminWalletTransactionRepository
            .create(
                executor,
                {
                    adminId:
                        adminDebit.userId,

                    type:
                        AdminWalletTransactionType
                            .REWARD_PAYOUT,

                    amount:
                        dto.amount.toFixed(2),

                    balanceBefore:
                        adminDebit.balanceBefore.toFixed(
                            2,
                        ),

                    balanceAfter:
                        adminDebit.balanceAfter.toFixed(
                            2,
                        ),

                    description:
                        dto.description ??
                        "Referral reward payout.",

                    metadata: {
                        reference,

                        userId:
                            dto.userId,

                        transactionType:
                            dto.type,

                        ...dto.metadata,
                    },
                },
            );

        // --------------------------------------------
        // 3. Create ADMIN debit transaction.
        //
        // FIX:
        // DTO FIRST, executor SECOND.
        // --------------------------------------------

        await transactionService
            .createSystemTransaction(
                {
                    userId:
                        adminDebit.userId,

                    walletId:
                        adminDebit.walletId,

                    amount:
                        dto.amount.toFixed(2),

                    balanceBefore:
                        adminDebit.balanceBefore.toFixed(
                            2,
                        ),

                    balanceAfter:
                        adminDebit.balanceAfter.toFixed(
                            2,
                        ),

                    type:
                        TransactionType.ADMIN_WITHDRAWAL,

                    status:
                        TransactionStatus.COMPLETED,

                    reference:
                        `ADMIN-${reference}`,

                    description:
                        `Referral reward payout to user ${dto.userId}.`,

                    metadata: {
                        payoutReference:
                            reference,

                        recipientId:
                            dto.userId,

                        direction:
                            "DEBIT",

                        ...dto.metadata,
                    },
                },

                executor,
            );

        // --------------------------------------------
        // 4. Lock recipient wallet.
        // --------------------------------------------

        const wallet =
            await walletService.lockByUserId(
                executor,
                dto.userId,
            );

        const balanceBefore =
            Number(
                wallet.availableBalance,
            );

        const balanceAfter =
            balanceBefore +
            dto.amount;

        // --------------------------------------------
        // 5. Credit recipient wallet.
        // --------------------------------------------

        await walletService.creditLockedWallet(
            executor,
            wallet.id,
            balanceAfter.toFixed(2),
        );

        // --------------------------------------------
        // 6. Create recipient transaction.
        //
        // FIX:
        // DTO FIRST, executor SECOND.
        // --------------------------------------------

        const transaction =
            await transactionService
                .createSystemTransaction(
                    {
                        userId:
                            dto.userId,

                        walletId:
                            wallet.id,

                        amount:
                            dto.amount.toFixed(2),

                        balanceBefore:
                            balanceBefore.toFixed(
                                2,
                            ),

                        balanceAfter:
                            balanceAfter.toFixed(
                                2,
                            ),

                        type:
                            dto.type,

                        status:
                            TransactionStatus.COMPLETED,

                        reference,

                        description:
                            dto.description,

                        metadata: {
                            direction:
                                "CREDIT",

                            payoutReference:
                                reference,

                            ...dto.metadata,
                        },
                    },

                    executor,
                );

        // --------------------------------------------
        // 7. Notify recipient.
        // --------------------------------------------

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

        return {
            success: true,

            userId:
                dto.userId,

            walletId:
                wallet.id,

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