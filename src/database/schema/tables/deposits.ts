import {
    pgTable,
    uuid,
    varchar,
    numeric,
    timestamp,
    text,
    jsonb,
    pgEnum,
    index,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { wallets } from "./wallets";
import { DepositStatus } from "../../enums/deposit.enum";

export const depositStatusEnum = pgEnum(
    "deposit_status",
    Object.values(
        DepositStatus,
    ) as [
        DepositStatus,
        ...DepositStatus[],
    ],
);

export const deposits = pgTable(
    "deposits",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        /**
         * Deposit reference.
         *
         * Example:
         * DEP-1748539200-AB12CD34
         */
        reference: varchar("reference", {
            length: 100,
        })
            .notNull()
            .unique(),

        /**
         * User requesting the deposit.
         */
        userId: uuid("user_id")
            .references(() => users.id, {
                onDelete: "cascade",
            })
            .notNull(),

        /**
         * User wallet.
         */
        walletId: uuid("wallet_id")
            .references(() => wallets.id, {
                onDelete: "cascade",
            })
            .notNull(),

        /**
         * Amount claimed by the user.
         */
        amount: numeric("amount", {
            precision: 12,
            scale: 2,
        }).notNull(),

        /**
         * Sender account name.
         */
        accountName: varchar(
            "account_name",
            {
                length: 120,
            },
        ).notNull(),

        /**
         * Sender account number.
         */
        accountNumber: varchar(
            "account_number",
            {
                length: 20,
            },
        ).notNull(),

        /**
         * Sender bank.
         */
        bankName: varchar(
            "bank_name",
            {
                length: 120,
            },
        ).notNull(),

        /**
         * Uploaded payment receipt.
         *
         * Stores Cloudinary URL,
         * S3 URL,
         * or local file path.
         */
        paymentReceipt: text(
            "payment_receipt",
        ).notNull(),

        /**
         * Current review status.
         */
        status: depositStatusEnum(
            "status",
        )
            .default(
                DepositStatus.PENDING,
            )
            .notNull(),

        /**
         * Admin reviewing the request.
         */
        reviewedBy: uuid(
            "reviewed_by",
        ).references(
            () => users.id,
            {
                onDelete: "set null",
            },
        ),

        /**
         * Review timestamp.
         */
        reviewedAt: timestamp(
            "reviewed_at",
        ),

        /**
         * Optional admin remark.
         */
        adminRemark: text(
            "admin_remark",
        ),

        /**
         * Extra information.
         *
         * Future payment gateway data,
         * IP address,
         * device,
         * etc.
         */
        metadata: jsonb(
            "metadata",
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
    (table) => ({
        userIdx: index(
            "deposits_user_idx",
        ).on(table.userId),

        walletIdx: index(
            "deposits_wallet_idx",
        ).on(table.walletId),

        statusIdx: index(
            "deposits_status_idx",
        ).on(table.status),

        reviewedByIdx: index(
            "deposits_reviewed_by_idx",
        ).on(table.reviewedBy),

        createdAtIdx: index(
            "deposits_created_at_idx",
        ).on(table.createdAt),

        referenceIdx: index(
            "deposits_reference_idx",
        ).on(table.reference),
    }),
);