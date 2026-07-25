import {
    pgTable,
    uuid,
    numeric,
    timestamp,
    uniqueIndex,
    foreignKey,
    check,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

import { users } from "./users";

export const wallets = pgTable(
    "wallets",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        /**
         * One wallet belongs to one user.
         */
        userId: uuid("user_id")
            .notNull(),

        /**
         * Money available for withdrawal
         * or future transactions.
         */
        availableBalance: numeric(
            "available_balance",
            {
                precision: 12,
                scale: 2,
            }
        )
            .default("0.00")
            .notNull(),

        /**
         * Money temporarily locked.
         *
         * Example:
         * Pending withdrawal.
         */
        heldBalance: numeric(
            "held_balance",
            {
                precision: 12,
                scale: 2,
            }
        )
            .default("0.00")
            .notNull(),

        /**
         * Total earnings generated
         * by the platform.
         *
         * Never decreases.
         */
        totalEarned: numeric(
            "total_earned",
            {
                precision: 12,
                scale: 2,
            }
        )
            .default("0.00")
            .notNull(),

        /**
         * Reserved for future features.
         *
         * Currently your platform
         * doesn't support deposits,
         * so this will remain 0.00.
         */
        totalDeposited: numeric(
            "total_deposited",
            {
                precision: 12,
                scale: 2,
            }
        )
            .default("0.00")
            .notNull(),

        /**
         * Total successful withdrawals.
         *
         * Never decreases.
         */
        totalWithdrawn: numeric(
            "total_withdrawn",
            {
                precision: 12,
                scale: 2,
            }
        )
            .default("0.00")
            .notNull(),

        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),

        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: "wallets_user_fk",
        }).onDelete("cascade"),

        uniqueIndex(
            "wallets_user_id_unique"
        ).on(table.userId),

        check(
            "wallet_available_balance_non_negative",
            sql`${table.availableBalance} >= 0`
        ),

        check(
            "wallet_held_balance_non_negative",
            sql`${table.heldBalance} >= 0`
        ),

        check(
            "wallet_total_earned_non_negative",
            sql`${table.totalEarned} >= 0`
        ),

        check(
            "wallet_total_deposited_non_negative",
            sql`${table.totalDeposited} >= 0`
        ),

        check(
            "wallet_total_withdrawn_non_negative",
            sql`${table.totalWithdrawn} >= 0`
        ),
    ]
);