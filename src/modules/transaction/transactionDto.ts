import { TransactionStatus, TransactionType } from "@/database/enums/transaction.enum";


export interface CommissionTransactionMetadata {
    buyerId: string;

    buyerMembershipPlanId: string;

    level: 1 | 2 | 3;

    commissionRate: string;

    commissionPercentage: number;

    source:
        | "membership_purchase"
        | "membership_upgrade";
}

export interface CreateSystemTransactionDto {
    userId: string;

    walletId: string;

    amount: string;

    type: TransactionType;

    status: TransactionStatus;

    reference: string;

    balanceBefore: string;

    balanceAfter: string;

    description?: string;

    metadata?: CommissionTransactionMetadata | Record<string, unknown>;
}