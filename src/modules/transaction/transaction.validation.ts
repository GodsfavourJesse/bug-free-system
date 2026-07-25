import { InvalidWalletAmountError } from "@/modules/wallet/wallet.errors";
import { TransactionStatus, TransactionType } from "@/database/enums/transaction.enum";
import { InvalidTransactionStatusError, InvalidTransactionTypeError, TransactionNotFoundError } from "./transaction.errors";


export class TransactionValidation {

    // Ensures the transaction amount is valid.
    validateAmount(amount: number) {

        if (!Number.isFinite(amount) || amount <= 0) {
            throw new InvalidWalletAmountError();
        }

        return amount;
    }

    // Ensures a transaction exists.
    ensureTransactionExists<T>(
        transaction: T | null,
    ): T {

        if (!transaction) {
            throw new TransactionNotFoundError();
        }

        return transaction;
    }

    // Ensures the transaction status is valid.
    validateStatus(
        status: string,
    ): TransactionStatus {

        if (
            !Object.values(
                TransactionStatus,
            ).includes(
                status as TransactionStatus,
            )
        ) {
            throw new InvalidTransactionStatusError();
        }

        return status as TransactionStatus;
    }

    // Ensures the transaction type is valid.
    validateType(
        type: string,
    ): TransactionType {

        if (
            !Object.values(
                TransactionType,
            ).includes(
                type as TransactionType,
            )
        ) {
            throw new InvalidTransactionTypeError();
        }

        return type as TransactionType;
    }
}

export const transactionValidation =
    new TransactionValidation();