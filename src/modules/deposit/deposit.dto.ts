import { z } from "zod";


/**
 * ----------------------------------------
 * User creates a deposit request.
 * ----------------------------------------
 */
export const createDepositSchema = z.object({
    amount: z
    .number()
    .positive("Amount must be greater than zero."),

    senderAccountName: z
        .string()
        .trim()
        .min(2, "Account name is required.")
        .max(120),

    senderAccountNumber: z
        .string()
        .regex(/^[0-9]{10}$/, "Account number must be 10 digits."),

    senderBankName: z
        .string()
        .trim()
        .min(2, "Bank name is required.")
        .max(120),

    paymentReceipt: z
        .string()
        .url("Payment receipt is required."),
});

export type CreateDepositDto =
    z.infer<
        typeof createDepositSchema
    >;
