import { sharePurchaseStatus, ShareStatus } from "../../../database/enums/share.enum";

export interface AdminSharePurchaserDetailsUserDto {
    id: string;
    phone: string;
    email: string | null;
}

export interface AdminSharePurchaserDetailsShareDto {
    id: string;
    name: string;
    logo: string | null;
    description: string | null;
    dailyReturnPercentage: string;
    cycleDays: number;
    status: ShareStatus;
}

export interface AdminSharePurchaserDetailsDto {
    purchaseId: string;
    share: AdminSharePurchaserDetailsShareDto;
    user: AdminSharePurchaserDetailsUserDto;
    purchaseAmount: string;
    dailyReturn: string;
    totalReturn: string;
    dailyReturnPercentage: string;
    cycleDays: number;
    status: sharePurchaseStatus;
    purchasedAt: Date;
    expectedReturnAt: Date;
    expiresAt: Date;
    returnedAt: Date | null;
    returnAmount: string | null;
    returnReference: string | null;
}

export interface AdminSharePurchaserDetailsResponseDto {
    data: AdminSharePurchaserDetailsDto;
}