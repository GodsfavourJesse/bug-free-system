import { randomUUID } from "crypto";
import { transactionRepository } from "./transaction.repository";
import { transactionValidation } from "./transaction.validation";
import { DuplicateTransactionReferenceError } from "./transaction.errors";
import { CreateSystemTransactionDto } from "./transactionDto";import { TransactionStatus, TransactionType } from "../../database/enums/transaction.enum";
import { DbExecutor } from "../../database/types/types";
import { db } from "../../database";
;

export class TransactionService {

    private buildPagination(
        page: number,
        limit: number,
        total: number,
    ) {
        const totalPages = Math.ceil(
            total / limit,
        );

        return {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };
    }

    // Creates a transaction record.
    async create(
        data: {
            userId: string;
            walletId: string;
            type: TransactionType;
            amount: number;
            balanceBefore: number;
            balanceAfter: number;
            description?: string;
            metadata?: Record<
                string,
                unknown
            >;
            status?: TransactionStatus;
            reference?: string;
        },
        executor: DbExecutor = db,
    ) {

        transactionValidation.validateAmount(
            data.amount,
        );

        transactionValidation.validateType(
            data.type,
        );

        if (data.status) {
            transactionValidation.validateStatus(
                data.status,
            );
        }

        const reference =
            data.reference ??
            this.generateReference();

        const existing = await transactionRepository.findByReference(
            executor,
            reference,
        );

        if (existing) {
            throw new DuplicateTransactionReferenceError();
        }

        return transactionRepository.create(
            executor,
            {
                userId: data.userId,
                walletId: data.walletId,
                type: data.type,
                amount: data.amount.toFixed(2),
                balanceBefore: data.balanceBefore.toFixed(2),
                balanceAfter: data.balanceAfter.toFixed(2),
                status:
                    data.status ??
                    TransactionStatus.COMPLETED,
                reference,
                description: data.description,
                metadata: data.metadata,
            },
        );
    }

    // Finds a transaction by its ID.
    async findById(id: string) {
        const transaction = await transactionRepository.findById(
            db,
            id,
        );

        return transactionValidation.ensureTransactionExists(
            transaction,
        );
    }

    // Finds a transaction by its reference.
    async findByReference(
        reference: string,
    ) {
        const transaction = await transactionRepository.findByReference(
            db,
            reference,
        );

        return transactionValidation.ensureTransactionExists(
            transaction,
        );
    }

    // Returns paginated transactions belonging to a user.
    async findByUser(
        userId: string,
        page: number = 1,
        limit: number = 20,
    ) {
        const result =
            await transactionRepository.findByUser(
                db,
                userId,
                page,
                limit,
            );

        return {
            data: result.data,

            pagination: this.buildPagination(
                page,
                limit,
                result.total,
            ),
        };
    }

    // Returns paginated transactions belonging to a wallet.
    async findByWallet(
        walletId: string,
        page: number = 1,
        limit: number = 20,
    ) {
        const result =
            await transactionRepository.findByWallet(
                db,
                walletId,
                page,
                limit,
            );

        return {
            data: result.data,

            pagination: this.buildPagination(
                page,
                limit,
                result.total,
            ),
        };
    }

    // Updates the transaction status.
    async updateStatus(
        id: string,
        status: TransactionStatus,
        executor: DbExecutor = db,
    ) {
        transactionValidation.validateStatus(
            status,
        );

        const transaction = await transactionRepository.findById(
            executor,
            id,
        );

        transactionValidation.ensureTransactionExists(
            transaction,
        );

        return transactionRepository.updateStatus(
            executor,
            id,
            status,
        );
    }

    // Find transaction
    async findByWithdrawalId(
        withdrawalId: string,
        executor: DbExecutor = db,
    ) {
        const transaction =
            await transactionRepository.findByWithdrawalId(
                executor,
                withdrawalId,
            );

        return transactionValidation.ensureTransactionExists(
            transaction,
        );
    }

    // Update transaction status
    async updateTransactionStatusByWithdrawalId(
        executor: DbExecutor,
        withdrawalId: string,
        status: TransactionStatus,
    ) {
        transactionValidation.validateStatus(
            status,
        );

        await this.findByWithdrawalId(
            withdrawalId,
            executor,
        );

        return transactionRepository.updateStatusByWithdrawalId(
            executor,
            withdrawalId,
            status,
        );
    }

    // Create a transaction from another module.
    //
    // Used by:
    // - Upgrade
    // - Withdrawal
    // - Commission
    // - Wallet
    async createSystemTransaction(
        executor: DbExecutor = db,
        dto: CreateSystemTransactionDto,
    ) {
        return transactionRepository.create(
            executor,
            {
                userId: dto.userId,

                walletId: dto.walletId,

                amount: dto.amount,

                balanceBefore: dto.balanceBefore,

                balanceAfter: dto.balanceAfter,

                type: dto.type,

                status: dto.status,

                reference: dto.reference ?? this.generateReference(),

                description: dto.description,

                metadata: dto.metadata,
            },
        );
    }

    // Generates a unique transaction reference.
    generateReference() {
        return `TXN-${Date.now()}-${randomUUID()
            .replace(/-/g, "")
            .substring(0, 8)
            .toUpperCase()}`;
    }
}

export const transactionService = new TransactionService();