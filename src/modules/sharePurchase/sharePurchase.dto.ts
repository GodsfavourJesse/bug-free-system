export interface BuyShareDto {
    amount: number;
}

export interface SharePurchaseCalculation {
    purchaseAmount: number;

    dailyReturn: number;

    cycleDays: number;

    totalReturn: number;

    expectedReturnAt: Date;

    expiresAt: Date;
}

export interface SharePurchaseReceipt {
    purchaseId: string;

    shareId: string;

    shareName: string;

    logo: string | null;

    description: string | null;

    percentage: number;

    cycleDays: number;

    purchaseAmount: number;

    dailyReturn: number;

    totalReturn: number;

    status: string;

    purchasedAt: Date;

    expectedReturnAt: Date;

    expiresAt: Date;
}