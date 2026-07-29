import { relations } from "drizzle-orm";
import { advertisements, dailyOrderItems, dailyOrders } from "../schema";

export const dailyOrderItemRelations = relations(
    dailyOrderItems,
    ({ one }) => ({
        order: one(dailyOrders, {
            fields: [dailyOrderItems.dailyOrderId],
            references: [dailyOrders.id],
        }),

        advertisement: one(advertisements, {
            fields: [dailyOrderItems.advertisementId],
            references: [advertisements.id],
        }),
    }),
);