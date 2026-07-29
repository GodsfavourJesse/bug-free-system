import { pgTable, uuid, numeric, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { dailyOrders } from "./dailyOrders";
import { advertisements } from "./advertisements";


export const dailyOrderItemStatusEnum =
    pgEnum(
        "daily_order_item_status",
        [
            "pending",
            "completed",
            "expired",
        ],
    );

export const dailyOrderItems =
    pgTable(
        "daily_order_items",
        {
            id: uuid("id")
                .defaultRandom()
                .primaryKey(),

            dailyOrderId: uuid(
                "daily_order_id",
            )
                .references(
                    () =>
                        dailyOrders.id,
                )
                .notNull(),

            // Task number (1,2,3...)
            sequence: integer(
                "sequence",
            ).notNull(),

            // Advertisement assigned to this task.
            advertisementId: uuid("advertisement_id")
                .references(() => advertisements.id)
                .notNull(),

            reward: numeric(
                "reward",
                {
                    precision: 12,
                    scale: 2,
                },
            ).notNull(),

            status:
                dailyOrderItemStatusEnum(
                    "status",
                )
                    .default(
                        "pending",
                    )
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