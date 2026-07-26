import { desc, eq } from "drizzle-orm";
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

    // Returns every transaction belonging to a user.
    // Newest transactions come first.
    async findByUser(
        executor: DbExecutor = db,
        userId: string,
    ) {
        return executor
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
            );
    }

    // Returns every transaction belonging to a wallet.
    // Newest transactions come first.
    async findByWallet(
        executor: DbExecutor = db,
        walletId: string,
    ) {
        return executor
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
            );
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
}

export const transactionRepository = new TransactionRepository();