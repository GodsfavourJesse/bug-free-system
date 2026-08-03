import {
    DepositNotFoundError,
    DuplicatePendingDepositError,
    InvalidDepositStatusError,
    UnauthorizedDepositError,
} from "./deposit.errors";
import { DepositStatus } from "../../database/enums/deposit.enum";

import { InferSelectModel } from "drizzle-orm";

import { deposits } from "../../database/schema";

type Deposit = InferSelectModel<typeof deposits>;

export class DepositValidation {
    /**
     * Ensure deposit exists.
     */
    ensureDepositExists(deposit: Deposit | null): Deposit {
        if (!deposit) {
            throw new DepositNotFoundError();
        }

        return deposit;
    }

    /**
     * Ensure user has no pending deposit.
     */
    ensureNoPendingDeposit(deposit: Deposit | null): void {
        if (deposit) {
            throw new DuplicatePendingDepositError();
        }
    }

    /**
     * Ensure deposit is still pending.
     */
    ensurePending(deposit: Deposit): void {
        if (deposit.status !== DepositStatus.PENDING) {
            throw new InvalidDepositStatusError();
        }
    }

    /**
     * Ensure deposit belongs to authenticated user.
     */
    ensureBelongsToUser(
        deposit: Deposit,
        userId: string,
    ): void {
        if (deposit.userId !== userId) {
            throw new UnauthorizedDepositError();
        }
    }

    /**
     * Validate deposit amount.
     */
    validateAmount(amount: number): void {
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error("Deposit amount must be greater than zero.");
        }
    }

    /**
     * Validate payment receipt.
     */
    validateReceipt(receiptUrl: string): void {
        if (!receiptUrl.trim()) {
            throw new Error("Payment receipt is required.");
        }
    }
}

export const depositValidation = new DepositValidation();