import {
    pgTable,
    uuid,
    numeric,
    varchar,
    text,
    timestamp,
    pgEnum,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { wallets } from "./wallets";
import { WithdrawalStatus } from "../../enums/withdrawal.enum";

export const withdrawalStatusEnum =
    pgEnum(
        "withdrawal_status",
        Object.values(
            WithdrawalStatus,
        ) as [
            WithdrawalStatus,
            ...WithdrawalStatus[],
        ],
    );

export const withdrawals =
    pgTable(
        "withdrawals",
        {
            id: uuid("id")
                .defaultRandom()
                .primaryKey(),

            userId: uuid("user_id")
                .references(() => users.id)
                .notNull(),

            walletId: uuid("wallet_id")
                .references(() => wallets.id)
                .notNull(),

            amount: numeric(
                "amount",
                {
                    precision: 12,
                    scale: 2,
                },
            ).notNull(),

            accountName: varchar(
                "account_name",
                {
                    length: 120,
                },
            ).notNull(),

            accountNumber: varchar(
                "account_number",
                {
                    length: 20,
                },
            ).notNull(),

            bankName: varchar(
                "bank_name",
                {
                    length: 120,
                },
            ).notNull(),

            status:
                withdrawalStatusEnum(
                    "status",
                )
                    .default(
                        WithdrawalStatus.PENDING,
                    )
                    .notNull(),

            reviewedBy: uuid(
                "reviewed_by",
            ).references(
                () => users.id,
            ),

            reviewedAt:
                timestamp(
                    "reviewed_at",
                ),

            adminRemark: text(
                "admin_remark",
            ),

            createdAt:
                timestamp(
                    "created_at",
                )
                    .defaultNow()
                    .notNull(),

            updatedAt:
                timestamp(
                    "updated_at",
                )
                    .defaultNow()
                    .$onUpdate(
                        () =>
                            new Date(),
                    )
                    .notNull(),
        },
    );