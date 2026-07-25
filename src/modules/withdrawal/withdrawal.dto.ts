// User creates a withdrawal request.
export interface CreateWithdrawalDto {
    userId: string;
    amount: string;
    accountName: string;
    accountNumber: string;
    bankName: string;
}

// Admin approves a withdrawal.
export interface ApproveWithdrawalDto {
    withdrawalId: string;
    adminId: string;
    adminRemark?: string;
}

// Admin rejects a withdrawal.
export interface RejectWithdrawalDto {
    withdrawalId: string;
    adminId: string;
    adminRemark: string;
}

// Admin marks an approved withdrawal as paid.
export interface MarkWithdrawalPaidDto {
    withdrawalId: string;
    adminId: string;
}