import {
    pgTable,
    uuid,
    varchar,
    numeric,
    integer,
    boolean,
    timestamp,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";

export const membershipPlans = pgTable(
    "membership_plans",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        /**
         * Membership name.
         *
         * Examples:
         * - Internship Member
         * - 1-Star Member
         * - VIP Member
         */
        name: varchar("name", {
            length: 100,
        }).notNull(),

        /**
         * URL-friendly identifier.
         *
         * Examples:
         * - internship
         * - 1-star
         * - vip
         */
        slug: varchar("slug", {
            length: 50,
        })
            .notNull()
            .unique(),

        /**
         * Cost to upgrade into this membership.
         *
         * Internship = ₦0
         */
        upgradePrice: numeric(
            "upgrade_price",
            {
                precision: 12,
                scale: 2,
            },
        )
            .default("0")
            .notNull(),

        /**
         * Maximum lifetime orders.
         *
         * NULL = unlimited.
         */
        lifetimeOrderLimit: integer(
            "lifetime_order_limit",
        ),

        /**
         * Determines the display order.
         */
        sortOrder: integer(
            "sort_order",
        ).notNull(),

        /**
         * Description shown in the UI.
         */
        description: varchar(
            "description",
            {
                length: 255,
            },
        ),

        /**
         * Invitation commission percentages.
         */

        invitationCommissionLevel1: numeric(
            "invitation_commission_level_1",
            {
                precision: 5,
                scale: 2,
            },
        ).notNull(),

        invitationCommissionLevel2: numeric(
            "invitation_commission_level_2",
            {
                precision: 5,
                scale: 2,
            },
        ).notNull(),

        invitationCommissionLevel3: numeric(
            "invitation_commission_level_3",
            {
                precision: 5,
                scale: 2,
            },
        ).notNull(),

        /**
         * Daily order referral commission percentages.
         */

        orderCommissionLevel1: numeric(
            "order_commission_level_1",
            {
                precision: 5,
                scale: 2,
            },
        ).notNull(),

        orderCommissionLevel2: numeric(
            "order_commission_level_2",
            {
                precision: 5,
                scale: 2,
            },
        ).notNull(),

        orderCommissionLevel3: numeric(
            "order_commission_level_3",
            {
                precision: 5,
                scale: 2,
            },
        ).notNull(),

        /**
         * Whether this is the default membership
         * assigned to newly registered users.
         */
        isInternship: boolean(
            "is_internship",
        )
            .default(false)
            .notNull(),

        /**
         * Whether the membership is active.
         */
        isActive: boolean(
            "is_active",
        )
            .default(true)
            .notNull(),

        /**
         * Whether users can upgrade into this plan.
         *
         * Existing members may remain on the plan
         * even when upgrades are disabled.
         */
        canUpgradeTo: boolean(
            "can_upgrade_to",
        )
            .default(true)
            .notNull(),

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
        uniqueIndex(
            "membership_plans_name_unique",
        ).on(table.name),

        uniqueIndex(
            "membership_plans_sort_order_unique",
        ).on(table.sortOrder),

        index(
            "membership_plans_slug_idx",
        ).on(table.slug),

        index(
            "membership_plans_sort_order_idx",
        ).on(table.sortOrder),

        index(
            "membership_plans_is_active_idx",
        ).on(table.isActive),

        index(
            "membership_plans_can_upgrade_to_idx",
        ).on(table.canUpgradeTo),

        index(
            "membership_plans_is_internship_idx",
        ).on(table.isInternship),
    ],
);