import {
    pgTable,
    uuid,
    decimal,
    timestamp,
    varchar,
    jsonb,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { AdminWalletTransactionDirection } from "../../enums/admin-wallet-transaction.enum";

export const adminWalletTransactions =
    pgTable(
        "admin_wallet_transactions",
        {
            id: uuid("id")
                .defaultRandom()
                .primaryKey(),

            adminId: uuid("admin_id")
                .notNull()
                .references(
                    () => users.id,
                    {
                        onDelete: "cascade",
                    },
                ),

            type: varchar(
                "type",
                {
                    length: 50,
                },
            ).notNull(),

            direction: varchar(
                "direction",
                {
                    length: 20,
                    enum: Object.values(
                        AdminWalletTransactionDirection,
                    ) as [
                        AdminWalletTransactionDirection,
                        ...AdminWalletTransactionDirection[],
                    ],
                },
            ).notNull(),

            amount: decimal(
                "amount",
                {
                    precision: 18,
                    scale: 2,
                },
            ).notNull(),

            balanceBefore: decimal(
                "balance_before",
                {
                    precision: 18,
                    scale: 2,
                },
            ).notNull(),

            balanceAfter: decimal(
                "balance_after",
                {
                    precision: 18,
                    scale: 2,
                },
            ).notNull(),

            description: varchar(
                "description",
                {
                    length: 255,
                },
            ).notNull(),

            metadata: jsonb(
                "metadata",
            ),

            createdAt: timestamp(
                "created_at",
            )
                .defaultNow()
                .notNull(),
        },
    );