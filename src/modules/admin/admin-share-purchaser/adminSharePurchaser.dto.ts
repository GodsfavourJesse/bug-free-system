import { sharePurchaseStatus } from "../../../database/enums/share.enum";

export interface AdminSharePurchaserListQueryDto {
    page?: number;
    limit?: number;
}

export interface AdminSharePurchaserUserDto {
    id: string;
    phone: string;
    email: string | null;
}

export interface AdminSharePurchaserListItemDto {
    purchaseId: string;

    user: AdminSharePurchaserUserDto;

    purchaseAmount: string;

    dailyReturn: string;

    totalReturn: string;

    status: sharePurchaseStatus;

    purchasedAt: Date;

    expectedReturnAt: Date;

    expiresAt: Date;
}

export interface AdminSharePurchaserListResponseDto {
    data: AdminSharePurchaserListItemDto[];

    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}