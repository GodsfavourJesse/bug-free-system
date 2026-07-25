import { pgTable, uuid, varchar, decimal, timestamp, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";
import { wallets } from "./wallets";
import { TransactionStatus, TransactionType } from "@/database/enums/transaction.enum";


export const transactions = pgTable(
    "transactions",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        userId: uuid("user_id")
            .notNull()
            .references(
                () => users.id,
                {
                    onDelete: "cascade",
                },
            ),

        walletId: uuid("wallet_id")
            .notNull()
            .references(
                () => wallets.id,
                {
                    onDelete: "cascade",
                },
            ),

        type: varchar("type", {
            length: 50,
            enum: Object.values(TransactionType) as [
                TransactionType,
                ...TransactionType[],
            ],
        }).notNull(),

        amount: decimal("amount", {
            precision: 18,
            scale: 2,
        }).notNull(),

        balanceBefore: decimal("balance_before", {
            precision: 18,
            scale: 2,
        }).notNull(),

        balanceAfter: decimal("balance_after", {
            precision: 18,
            scale: 2,
        }).notNull(),

        status: varchar("status", {
            length: 30,
            enum: Object.values(TransactionStatus) as [
                TransactionStatus,
                ...TransactionStatus[],
            ],
        })
            .notNull()
            .default(TransactionStatus.COMPLETED),

        reference: varchar("reference", {
            length: 100,
        }).notNull(),

        description: varchar("description", {
            length: 255,
        }),

        metadata: jsonb("metadata"),

        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        userIdx: index("transactions_user_idx").on(table.userId),

        walletIdx: index("transactions_wallet_idx").on(table.walletId),

        statusIdx: index("transactions_status_idx").on(table.status),

        createdAtIdx: index("transactions_created_at_idx").on(table.createdAt),

        referenceIdx: uniqueIndex("transactions_reference_idx").on(
            table.reference,
        ),
    }),
);