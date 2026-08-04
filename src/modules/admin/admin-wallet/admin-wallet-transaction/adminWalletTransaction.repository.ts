import { desc, eq } from "drizzle-orm";
import { db } from "../../../../database";
import { adminWalletTransactions } from "../../../../database/schema";
import { DbExecutor } from "../../../../database/types/types";

export class AdminWalletTransactionRepository {

    async findAll(
        executor: DbExecutor = db,
    ) {
        return executor
            .select()
            .from(
                adminWalletTransactions
            )
            .orderBy(
                desc(
                    adminWalletTransactions.createdAt
                )
            );

    }

    async create(
        executor: DbExecutor = db,
        data: typeof adminWalletTransactions.$inferInsert,

    ) {
        const [transaction] =
            await executor
                .insert(
                    adminWalletTransactions
                )
                .values(data)
                .returning();

        console.log("Created transaction:", transaction);


        return transaction;
    }

}

export const adminWalletTransactionRepository = new AdminWalletTransactionRepository();