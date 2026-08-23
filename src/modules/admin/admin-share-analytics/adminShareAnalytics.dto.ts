import { ShareStatus } from "../../../database/enums/share.enum";

export interface AdminShareAnalyticsDto {
    share: {
        id: string;
        name: string;
        logo: string | null;
        description: string | null;
        dailyReturnPercentage: string;
        cycleDays: number;
        status: ShareStatus;
        createdAt: Date;
        updatedAt: Date;
    };

    totalPurchasers: number;

    totalPurchaseAmount: string;

    totalExpectedReturns: string;

    totalReturnsCredited: string;

    remainingLiability: string;
}