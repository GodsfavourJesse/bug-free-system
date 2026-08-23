import { ShareStatus } from "../../database/enums/share.enum";

export interface CreateShareDto {
    name: string;
    logo?: string | null;
    description?: string | null;
    dailyReturnPercentage: number;
    cycleDays: number;
    status?: ShareStatus;
}

export interface UpdateShareDto {
    name?: string;
    logo?: string | null;
    description?: string | null;
    dailyReturnPercentage?: number;
    cycleDays?: number;
    // status?: ShareStatus;
}

export interface UpdateShareStatusDto {
    status: ShareStatus;
}

export interface ShareListQueryDto {
    page?: number;
    limit?: number;
    status?: ShareStatus;
    search?: string;
}