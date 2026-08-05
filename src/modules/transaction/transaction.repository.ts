import { count, desc, eq } from "drizzle-orm";
import { DbExecutor } from "../../database/types/types";
import { db } from "../../database";
import { transactions } from "../../database/schema";
import { TransactionStatus } from "../../database/enums/transaction.enum";

export class TransactionRepository {

    // Creates a new transaction record.
    async create(
        executor: DbExecutor = db,
        data: typeof transactions.$inferInsert,
    ) {
        const [transaction] = await executor
            .insert(transactions)
            .values(data)
            .returning();

        return transaction;
    }

    // Finds a transaction by its ID.
    async findById(
        executor: DbExecutor = db,
        id: string,
    ) {
        const result = await executor
            .select()
            .from(transactions)
            .where(eq(transactions.id, id))
            .limit(1);

        return result[0] ?? null;
    }

    // Finds a transaction by its unique reference.
    async findByReference(
        executor: DbExecutor = db,
        reference: string,
    ) {
        const result = await executor
            .select()
            .from(transactions)
            .where(
                eq(
                    transactions.reference,
                    reference,
                ),
            )
            .limit(1);

        return result[0] ?? null;
    }

    // Returns paginated transactions belonging to a user.
    // Newest transactions come first.
    async findByUser(
        executor: DbExecutor = db,
        userId: string,
        page: number = 1,
        limit: number = 20,
    ) {
        const offset = (page - 1) * limit;

        const data = await executor
            .select()
            .from(transactions)
            .where(
                eq(
                    transactions.userId,
                    userId,
                ),
            )
            .orderBy(
                desc(
                    transactions.createdAt,
                ),
            )
            .limit(limit)
            .offset(offset);

        const [{ total }] = await executor
            .select({
                total: count(),
            })
            .from(transactions)
            .where(
                eq(
                    transactions.userId,
                    userId,
                ),
            );

        return {
            data,
            total,
        };
    }

    // Returns paginated transactions belonging to a wallet.
    // Newest transactions come first.
    async findByWallet(
        executor: DbExecutor = db,
        walletId: string,
        page: number = 1,
        limit: number = 20,
    ) {
        const offset = (page - 1) * limit;

        const data = await executor
            .select()
            .from(transactions)
            .where(
                eq(
                    transactions.walletId,
                    walletId,
                ),
            )
            .orderBy(
                desc(
                    transactions.createdAt,
                ),
            )
            .limit(limit)
            .offset(offset);


        const [{ total }] = await executor
            .select({
                total: count(),
            })
            .from(transactions)
            .where(
                eq(
                    transactions.walletId,
                    walletId,
                ),
            );


        return {
            data,
            total,
        };
    }

    // Updates the status of a transaction.
    async updateStatus(
        executor: DbExecutor = db,
        id: string,
        status: TransactionStatus,
    ) {
        const [transaction] = await executor
            .update(transactions)
            .set({
                status,
            })
            .where(
                eq(
                    transactions.id,
                    id,
                ),
            )
            .returning();

        return transaction;
    }

    // FInd transaction by withdrawal.
    async findByWithdrawalId(
        executor: DbExecutor = db,
        withdrawalId: string,
    ) {
        const [transaction] =
            await executor
                .select()
                .from(transactions)
                .where(
                    eq(
                        transactions.withdrawId,
                        withdrawalId,
                    ),
                )
                .limit(1);

        return transaction ?? null;
    }

    // update transaction status by withdrawal
    async updateStatusByWithdrawalId(
        executor: DbExecutor = db,
        withdrawalId: string,
        status: TransactionStatus,
    ) {
        const [transaction] =
            await executor
                .update(transactions)
                .set({
                    status,
                })
                .where(
                    eq(
                        transactions.withdrawId,
                        withdrawalId,
                    ),
                )
                .returning();

        return transaction ?? null;
    }
}

export const transactionRepository = new TransactionRepository();