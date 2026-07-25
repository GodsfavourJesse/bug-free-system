import { pgTable, uuid, integer, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { membershipPlans } from "./membershipPlans";

export const dailyOrderConfigs = pgTable(
    "daily_order_configs",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        membershipPlanId: uuid("membership_plan_id")
            .notNull()
            .references(() => membershipPlans.id),

        // Number of tasks generated daily.
        tasksPerDay: integer("tasks_per_day")
            .notNull(),

        // Reward for each completed task.
        rewardPerTask: numeric(
            "reward_per_task",
            {
                precision: 12,
                scale: 2,
            },
        ).notNull(),

        // Maximum earnings for one day.
        dailyRewardLimit: numeric(
            "daily_reward_limit",
            {
                precision: 12,
                scale: 2,
            },
        ).notNull(),

        // Admin can disable configuration.
        isActive: boolean("is_active")
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
);