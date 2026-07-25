import {
    pgTable,
    uuid,
    numeric,
    integer,
    timestamp,
    pgEnum,
} from "drizzle-orm/pg-core";
import { dailyOrders } from "./dailyOrders";


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

            // Future advertisement.
            advertisementId: uuid(
                "advertisement_id",
            ),

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