// Pagination options.
export interface PaginationDto {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

// Search users.
export interface SearchUsersDto extends PaginationDto {
    query: string;
}

// Filter users.
export interface FilterUsersDto extends PaginationDto {
    membershipPlanId?: string;
    isActive?: boolean;
    isVerified?: boolean;
    role?: string;

    createdFrom?: Date;
    createdTo?: Date;
}

// Suspend a user.
export interface SuspendUserDto {
    userId: string;
}

// Activate a user.
export interface ActivateUserDto {
    userId: string;
}

// Verify a user.
export interface VerifyUserDto {
    userId: string;
}