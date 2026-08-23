import {
    pgTable,
    uuid,
    numeric,
    integer,
    timestamp,
    varchar,
    pgEnum,
    index,
    uniqueIndex,
    foreignKey,
    check,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

import { users } from "./users";
import { wallets } from "./wallets";
import { shares } from "./shares";
import { sharePurchaseStatus } from "../../enums/share.enum";


export const sharePurchaseStatusEnum =
    pgEnum(
        "share_purchase_status",
        [
            sharePurchaseStatus.ACTIVE,
            sharePurchaseStatus.COMPLETED,
            sharePurchaseStatus.RETURN_CREDITED,
        ],
    );

export const sharePurchases = pgTable(
    "share_purchases",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        /**
         * User who purchased the share.
         */
        userId: uuid("user_id")
            .notNull(),

        /**
         * Share plan purchased.
         */
        shareId: uuid("share_id")
            .notNull(),

        /**
         * User wallet used for purchase.
         */
        walletId: uuid("wallet_id")
            .notNull(),

        /**
         * Amount paid by the user.
         *
         * Example:
         * 50000.00
         */
        purchaseAmount: numeric(
            "purchase_amount",
            {
                precision: 18,
                scale: 2,
            },
        ).notNull(),

        /**
         * Snapshot of share percentage
         * at the exact time of purchase.
         *
         * Example:
         * 16.0000
         */
        dailyReturnPercentage: numeric(
            "daily_return_percentage",
            {
                precision: 8,
                scale: 4,
            },
        ).notNull(),

        /**
         * Daily return calculated at purchase.
         *
         * Example:
         * 50000 × 16% = 8000.
         */
        dailyReturnAmount: numeric(
            "daily_return_amount",
            {
                precision: 18,
                scale: 2,
            },
        ).notNull(),

        /**
         * Snapshot of cycle duration.
         */
        cycleDays: integer(
            "cycle_days",
        ).notNull(),

        /**
         * Total return expected at maturity.
         *
         * Example:
         * 8000 × 200 = 1600000.
         */
        totalReturnAmount: numeric(
            "total_return_amount",
            {
                precision: 18,
                scale: 2,
            },
        ).notNull(),

        /**
         * When the purchase happened.
         */
        purchasedAt: timestamp(
            "purchased_at",
        )
            .defaultNow()
            .notNull(),

        expectedReturnAt: timestamp(
            "expected_return_at",
        ).notNull(),

        /**
         * When the share return becomes
         * eligible for credit.
         */
        expiresAt: timestamp(
            "expires_at",
        ).notNull(),

        /**
         * When admin actually credited
         * the return to the user.
         */
        returnCreditedAt: timestamp(
            "return_credited_at",
        ),

        /**
         * Purchase lifecycle.
         */
        status: sharePurchaseStatusEnum(
            "status",
        )
            .default(
                sharePurchaseStatus.ACTIVE,
            )
            .notNull(),

        /**
         * Transaction reference created
         * when the user buys the share.
         */
        purchaseReference: varchar(
            "purchase_reference",
            {
                length: 100,
            },
        ).notNull(),

        /**
         * Transaction reference created
         * when the return is credited.
         */
        returnReference: varchar(
            "return_reference",
            {
                length: 100,
            },
        ),

        createdAt: timestamp(
            "created_at",
        )
            .defaultNow()
            .notNull(),

        updatedAt: timestamp(
            "updated_at",
        )
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },

    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: "share_purchases_user_fk",
        }).onDelete("restrict"),

        foreignKey({
            columns: [table.shareId],
            foreignColumns: [shares.id],
            name: "share_purchases_share_fk",
        }).onDelete("restrict"),

        foreignKey({
            columns: [table.walletId],
            foreignColumns: [wallets.id],
            name: "share_purchases_wallet_fk",
        }).onDelete("restrict"),

        index(
            "share_purchases_user_idx",
        ).on(table.userId),

        index(
            "share_purchases_share_idx",
        ).on(table.shareId),

        index(
            "share_purchases_wallet_idx",
        ).on(table.walletId),

        index(
            "share_purchases_status_idx",
        ).on(table.status),

        index(
            "share_purchases_expires_at_idx",
        ).on(table.expiresAt),

        index(
            "share_purchases_purchased_at_idx",
        ).on(table.purchasedAt),

        uniqueIndex(
            "share_purchases_purchase_reference_unique",
        ).on(table.purchaseReference),

        uniqueIndex(
            "share_purchases_return_reference_unique",
        ).on(table.returnReference),

        check(
            "share_purchases_purchase_amount_positive",
            sql`${table.purchaseAmount} > 0`,
        ),

        check(
            "share_purchases_daily_return_percentage_positive",
            sql`${table.dailyReturnPercentage} > 0`,
        ),

        check(
            "share_purchases_daily_return_amount_positive",
            sql`${table.dailyReturnAmount} > 0`,
        ),

        check(
            "share_purchases_cycle_days_positive",
            sql`${table.cycleDays} > 0`,
        ),

        check(
            "share_purchases_total_return_positive",
            sql`${table.totalReturnAmount} > 0`,
        ),
    ],
);