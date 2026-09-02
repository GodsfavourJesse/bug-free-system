import { AdminWalletTransactionDirection, AdminWalletTransactionType } from "../../database/enums/admin-wallet-transaction.enum";
import { TransactionStatus, TransactionType } from "../../database/enums/transaction.enum";

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
    withdrawId?: string;
    amount: string;
    balanceBefore: string;
    balanceAfter: string;
    type: TransactionType;
    status: TransactionStatus;
    reference?: string;
    description?: string;
    metadata?: Record<string, unknown>;
}

export interface PaginationDto {
    page?: number;
    limit?: number;
}

export interface CreateAdminWalletTransactionDto {
    adminId: string;
    type: AdminWalletTransactionType;
    amount: string;
    balanceBefore: string;
    balanceAfter: string;
    description: string;
    direction: AdminWalletTransactionDirection;
    metadata?: Record<string, unknown>;
}