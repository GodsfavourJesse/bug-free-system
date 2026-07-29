import {
    pgTable,
    uuid,
    timestamp,
    unique,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { advertisements } from "./advertisements";

export const completedAdvertisements = pgTable(
    "completed_advertisements",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        advertisementId: uuid("advertisement_id")
            .notNull()
            .references(() => advertisements.id, {
                onDelete: "cascade",
            }),

        completedAt: timestamp("completed_at")
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        uniqueCompletion: unique(
            "completed_advertisements_user_advertisement_unique",
        ).on(
            table.userId,
            table.advertisementId,
        ),
    }),
);