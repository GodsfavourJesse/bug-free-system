import { ShareStatus } from "../../../database/enums/share.enum";

export interface AdminShareListQueryDto {
    page?: number;
    limit?: number;
}

export interface AdminShareListItemDto {
    id: string;
    name: string;
    logo: string | null;
    logoPublicId?: string | null;
    description: string | null;
    dailyReturnPercentage: string;
    cycleDays: number;
    status: ShareStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface AdminShareListResponseDto {
    data: AdminShareListItemDto[];

    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

// ADMIN CREATE SHARE 
export interface CreateAdminShareDto {
    name: string;
    logo?: string | null;
    logoPublicId?: string | null;
    description?: string | null;
    dailyReturnPercentage: number;
    cycleDays: number;
}

// ADMIN UPDATE SHARE
export interface UpdateAdminShareDto {
    name?: string;
    logo?: string | null;
    logoPublicId?: string | null;
    description?: string | null;
    dailyReturnPercentage?: number;
    cycleDays?: number;
}