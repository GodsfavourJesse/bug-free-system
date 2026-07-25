import {
    pgTable,
    uuid,
    integer,
    numeric,
    date,
    timestamp,
    pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { membershipPlans } from "./membershipPlans";
import { dailyOrderConfigs } from "./dailyOrderConfigs";

export const dailyOrderStatusEnum =
    pgEnum(
        "daily_order_status",
        [
            "pending",
            "in_progress",
            "completed",
            "expired",
        ],
    );

export const dailyOrders =
    pgTable(
        "daily_orders",
        {
            id: uuid("id")
                .defaultRandom()
                .primaryKey(),

            userId: uuid("user_id")
                .references(() => users.id)
                .notNull(),

            membershipPlanId:
                uuid(
                    "membership_plan_id",
                )
                    .references(
                        () =>
                            membershipPlans.id,
                    )
                    .notNull(),

            configId: uuid(
                "config_id",
            )
                .references(
                    () =>
                        dailyOrderConfigs.id,
                )
                .notNull(),

            date: date("date")
                .notNull(),

            status:
                dailyOrderStatusEnum(
                    "status",
                )
                    .default(
                        "pending",
                    )
                    .notNull(),

            requiredTasks: integer(
                "required_tasks",
            ).notNull(),

            completedTasks: integer(
                "completed_tasks",
            )
                .default(0)
                .notNull(),

            totalReward: numeric(
                "total_reward",
                {
                    precision: 12,
                    scale: 2,
                },
            ).notNull(),

            rewardEarned: numeric(
                "reward_earned",
                {
                    precision: 12,
                    scale: 2,
                },
            )
                .default("0.00")
                .notNull(),

            completedAt:
                timestamp(
                    "completed_at",
                ),

            createdAt:
                timestamp(
                    "created_at",
                )
                    .defaultNow()
                    .notNull(),
        },
    );