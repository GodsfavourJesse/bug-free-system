import z from "zod";
import { DepositStatus } from "../../../database/enums/deposit.enum";

/**
 * ----------------------------------------
 * Admin approves a deposit.
 * ----------------------------------------
 */
export const approveDepositSchema = z.object({
    adminRemark: z
        .string()
       .trim()
        .max(500)
        .optional(),
});

export type ApproveDepositDto =
    z.infer<typeof approveDepositSchema>;

/**
 * ----------------------------------------
 * Admin rejects a deposit.
 * ----------------------------------------
 */
export const rejectDepositSchema = z.object({
    adminRemark: z
        .string({
            error: "Rejection reason is required.",
        })
        .trim()
        .min(
            3,
            "Rejection reason is required.",
        )
        .max(500),
});

export type RejectDepositDto =
    z.infer<typeof rejectDepositSchema>;

/**
 * ----------------------------------------
 * Internal DTO
 * ----------------------------------------
 */
export interface UpdateDepositStatusDto {
    depositId: string;
    adminId: string;
    status: DepositStatus;
    adminRemark?: string;
}

/**
 * ----------------------------------------
 * User returned with every deposit
 * ----------------------------------------
 */
export interface AdminDepositUserDto {
    id: string;

    phone: string;

    email: string | null;

    membership: {
        id: string;
        name: string;
        slug: string;
    } | null;
}

/**
 * ----------------------------------------
 * Deposit returned to Admin UI
 * ----------------------------------------
 */
export interface AdminDepositDto {
    id: string;

    reference: string;

    walletId: string;

    amount: string;

    accountName: string;

    accountNumber: string;

    bankName: string;

    paymentReceipt: string;

    status: DepositStatus;

    reviewedBy: string | null;

    reviewedAt: Date | null;

    adminRemark: string | null;

    metadata: Record<string, unknown> | null;

    createdAt: Date;

    updatedAt: Date;

    user: AdminDepositUserDto;
}