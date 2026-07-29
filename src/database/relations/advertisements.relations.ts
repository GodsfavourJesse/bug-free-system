import { relations } from "drizzle-orm";
import { advertisements, dailyOrderItems, users } from "../schema";

export const advertisementRelations = relations(
    advertisements,
    ({ one, many }) => ({
        admin: one(users, {
            fields: [advertisements.createdBy],
            references: [users.id],
        }),

        dailyOrderItems: many(dailyOrderItems),
    }),
);