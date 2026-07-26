import { CreateCommissionDto, ProcessCommissionDto } from "./commission.dto";
import { referralService } from "../referral/referral.service";
import { commissionValidation } from "./commission.validation";
import { commissionCalculator } from "./commission.calculator";
import { walletService } from "../wallet/wallet.service";
import { transactionService } from "../transaction/transaction.service";
import { notificationService } from "../notification/notification.service";
import { DbExecutor } from "../../database/types/types";
import { db } from "../../database";
import { TransactionStatus, TransactionType } from "../../database/enums/transaction.enum";
import { NotificationType } from "../../database/enums/notification.enum";
import { COMMISSION_SOURCES } from "../../constants/commision.constants";

export class CommissionService {

    // Process commissions for a product purchase.
    async processPurchase(
        executor: DbExecutor = db,
        dto: ProcessCommissionDto,
    ) {
        return this.process(
            executor,
            dto,
        );
    }

    // Process commissions for a membership upgrade.
    async processMembershipUpgrade(
        executor: DbExecutor = db,
        dto: Omit<ProcessCommissionDto, "source">,
    ) {
        return this.process(
            executor,
            {
                ...dto,
                source: COMMISSION_SOURCES.MEMBERSHIP_PURCHASE
            }
        );
    }

    // Orchestrates the entire commission workflow. 
    async process(
        executor: DbExecutor = db,
        dto: ProcessCommissionDto,
    ) {

        // Find Level 1, Level 2 and Level 3 uplines.
        const ancestors = await referralService.getAncestors(
            dto.buyerId,
        );

        if (ancestors.length === 0) {
            return [];
        }

        const payouts = [];

        // Pay each eligible ancestor.
        for (const ancestor of ancestors) {

            const payout = await this.payLevel(
                executor,
                {
                    recipientId: ancestor.user.id,
                    buyerId: dto.buyerId,
                    membershipPlanId: dto.membershipPlanId,
                    level: ancestor.level as 1 | 2 | 3,
                    amount: dto.amount,
                    reference: dto.reference,
                    source: dto.source,
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

    // Pay one referral level.
    private async payLevel(
        executor: DbExecutor,
        dto: CreateCommissionDto,
    ) {

        // Validate referral level.
        commissionValidation.ensureEligibleLevel(
            dto.level,
        );

        // Calculate commission.
        const commissionAmount = commissionCalculator.calculateByLevel(
            dto.amount,
            dto.level,
        );

        if (commissionAmount <= 0) {
            return null;
        }

        // Credit recipient wallet.
        const wallet = await this.creditCommission(
            executor,
            dto.recipientId,
            commissionAmount,
        );

        // Create commission transaction.
        const transaction = await this.createCommissionTransaction(
            executor,
            dto,
            wallet,
            commissionAmount,
        );

        // Notify recipient.
        await this.notifyRecipient(
            executor,
            dto,
            transaction.id,
            commissionAmount,
        );

        // Return payout details.
        return {
            recipientId: dto.recipientId,
            buyerId: dto.buyerId,
            level: dto.level,
            commission: commissionAmount,
            transactionId: transaction.id,
            walletId: wallet.id,
            reference: transaction.reference,
        };
    }

    // Credit commission to the recipient's wallet.
    private async creditCommission(
        executor: DbExecutor,
        recipientId: string,
        amount: number,
    ) {

        commissionValidation.validateCommissionAmount(
            amount,
        );

        const wallet = await walletService.credit(
            executor,
            recipientId,
            amount,
        );

        return wallet;
    }

    // Create the commission transaction.
    private async createCommissionTransaction(
        executor: DbExecutor,
        dto: CreateCommissionDto,
        wallet: Awaited<
            ReturnType<typeof walletService.credit>
        >,
        commissionAmount: number,
    ) {

        const balanceAfter = Number(wallet.availableBalance);

        const balanceBefore = balanceAfter - commissionAmount;

        return transactionService.createSystemTransaction(
            executor,
            {
                userId: dto.recipientId,
                walletId: wallet.id,
                amount: commissionAmount.toFixed(2),
                balanceBefore: balanceBefore.toFixed(2),
                balanceAfter: balanceAfter.toFixed(2),
                type: TransactionType.COMMISSION,
                status: TransactionStatus.COMPLETED,
                reference: `${dto.reference}-L${dto.level}`,
                description: `Level ${dto.level} referral commission`,

                metadata: {
                    buyerId: dto.buyerId,
                    membershipPlanId: dto.membershipPlanId,
                    purchaseReference: dto.reference,
                    referralLevel: dto.level,
                    source: dto.source,
                },
            },
        );
    }

    // Notify the commission recipient.
    private async notifyRecipient(
        executor: DbExecutor,
        dto: CreateCommissionDto,
        transactionId: string,
        commissionAmount: number,
    ) {

        return notificationService.notifyUser(
            executor,
            {
                userId: dto.recipientId,
                title: "Commission Received",

                message: 
                    `You've received ₦${commissionAmount.toLocaleString("en-NG", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    },
                )} as a Level ${dto.level} referral commission from a purchase in your referral network.`,

                type: NotificationType.COMMISSION,

                metadata: {
                    buyerId: dto.buyerId,
                    membershipPlanId: dto.membershipPlanId,
                    referralLevel: dto.level,
                    commissionAmount,
                    purchaseReference: dto.reference,
                    source: dto.source,
                    transactionId,
                },
            },
        );
    }
}

export const commissionService = new CommissionService();