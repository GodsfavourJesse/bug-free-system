// modules/reward-engine/rewardEngine.dto.ts

import { NotificationType } from "../../database/enums/notification.enum";
import {
    TransactionStatus,
    TransactionType,
} from "../../database/enums/transaction.enum";

export interface CreditRewardDto {
    userId: string;

    amount: number;

    type: TransactionType;

    description: string;

    notification: {
        title: string;
        message: string;
        type: NotificationType;
    };

    metadata?: Record<string, unknown>;
}

export interface RewardResultDto {
    success: boolean;

    userId: string;

    walletId: string;

    transactionId: string;

    amount: number;

    balanceBefore: number;

    balanceAfter: number;

    reference: string;

    status: TransactionStatus;
}

export interface ProcessCompletionDto {
    userId: string;
    advertisementId: string;
}