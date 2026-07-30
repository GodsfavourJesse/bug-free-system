import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    boolean,
    pgEnum,
    foreignKey,
    index,
} from "drizzle-orm/pg-core";

import { membershipPlans } from "./membershipPlans";

export const userRoleEnum = pgEnum(
    "user_role",
    [
        "admin",
        "user",
    ]
);

export const users = pgTable(
    "users",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        phone: varchar("phone", {
            length: 20,
        })
            .notNull()
            .unique(),

        email: varchar("email", {
            length: 255,
        }).unique(),

        password: varchar("password", {
            length: 255,
        }).notNull(),

        country: varchar("country", {
            length: 100,
        })
            .default("Nigeria")
            .notNull(),

        role: userRoleEnum("role")
            .default("user")
            .notNull(),

        /**
         * Membership Plan
         * Every user belongs to one plan.
         */
        membershipPlanId: uuid("membership_plan_id"),

        /**
         * Whether the user can still upgrade
         * to another membership.
         */
        canUpgrade: boolean("can_upgrade")
            .default(true)
            .notNull(),

        /**
         * Referral code shared by every account.
         *
         * Examples:
         * NEXUSADMIN
         * NX-8F3A1B2C
         */
        referralCode: varchar("referral_code", {
            length: 30,
        })
            .notNull()
            .unique(),

        /**
         * User that invited this account.
         *
         * NULL only for:
         * • Seeded admin account
         */
        referredBy: uuid("referred_by"),

        isVerified: boolean("is_verified")
            .default(false)
            .notNull(),

        isActive: boolean("is_active")
            .default(true)
            .notNull(),

        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),

        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),

        revokedAt: timestamp("revoked_at"),
    },
    (table) => [
        foreignKey({
            columns: [table.membershipPlanId],
            foreignColumns: [membershipPlans.id],
            name: "users_membership_plan_fk",
        }).onDelete("restrict"),

        foreignKey({
            columns: [table.referredBy],
            foreignColumns: [table.id],
            name: "users_referred_by_fk",
        }).onDelete("set null"),

        index("users_membership_plan_idx")
            .on(table.membershipPlanId),

        index("users_phone_idx")
            .on(table.phone),

        index("users_email_idx")
            .on(table.email),

        index("users_role_idx")
            .on(table.role),

        index("users_referral_code_idx")
            .on(table.referralCode),

        index("users_referred_by_idx")
            .on(table.referredBy),
    ]
);