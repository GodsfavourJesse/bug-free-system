import { pgTable, uuid, varchar, decimal, timestamp, text, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";

import { users } from "./users";
import { transactions } from "./transactions";
import { membershipPlans } from "./membershipPlans";

import { PaymentMethod, UpgradeRequestStatus } from "@/database/enums/upgrade.enum";

export const upgradeRequests = pgTable(
    "upgrade_requests",
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

        currentMembershipPlanId: uuid(
            "current_membership_plan_id",
        )
            .notNull()
            .references(
                () => membershipPlans.id,
                {
                    onDelete: "restrict",
                },
            ),

        requestedMembershipPlanId: uuid(
            "requested_membership_plan_id",
        )
            .notNull()
            .references(
                () => membershipPlans.id,
                {
                    onDelete: "restrict",
                },
            ),

        amount: decimal("amount", {
            precision: 18,
            scale: 2,
        }).notNull(),

        paymentMethod: varchar(
            "payment_method",
            {
                length: 30,
                enum: Object.values(
                    PaymentMethod,
                ) as [
                    PaymentMethod,
                    ...PaymentMethod[],
                ],
            },
        ).notNull(),

        paymentProof: text(
            "payment_proof",
        ),

        status: varchar("status", {
            length: 30,
            enum: Object.values(
                UpgradeRequestStatus,
            ) as [
                UpgradeRequestStatus,
                ...UpgradeRequestStatus[],
            ],
        })
            .notNull()
            .default(
                UpgradeRequestStatus.PENDING,
            ),

        reference: varchar("reference", {
            length: 150,
        }).notNull(),

        transactionId: uuid(
            "transaction_id",
        ).references(
            () => transactions.id,
            {
                onDelete: "set null",
            },
        ),

        reviewedBy: uuid(
            "reviewed_by",
        ).references(
            () => users.id,
            {
                onDelete: "set null",
            },
        ),

        reviewedAt: timestamp(
            "reviewed_at",
        ),

        rejectedReason: text(
            "rejected_reason",
        ),

        adminNote: text(
            "admin_note",
        ),

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
            "upgrade_requests_user_idx",
        ).on(table.userId),

        currentPlanIdx: index(
            "upgrade_requests_current_plan_idx",
        ).on(
            table.currentMembershipPlanId,
        ),

        requestedPlanIdx: index(
            "upgrade_requests_requested_plan_idx",
        ).on(
            table.requestedMembershipPlanId,
        ),

        statusIdx: index(
            "upgrade_requests_status_idx",
        ).on(table.status),

        reviewedByIdx: index(
            "upgrade_requests_reviewed_by_idx",
        ).on(table.reviewedBy),

        createdAtIdx: index(
            "upgrade_requests_created_at_idx",
        ).on(table.createdAt),

        referenceIdx: uniqueIndex(
            "upgrade_requests_reference_idx",
        ).on(table.reference),

        transactionIdx: index(
            "upgrade_requests_transaction_idx",
        ).on(table.transactionId),
    }),
);