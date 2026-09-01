import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    boolean,
    index,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const corporateAnnouncements =
    pgTable(
        "corporate_announcements",
        {
            id: uuid("id")
                .defaultRandom()
                .primaryKey(),

            title: varchar("title", {
                length: 150,
            }).notNull(),

            message: text("message")
                .notNull(),

            createdBy: uuid(
                "created_by",
            )
                .notNull()
                .references(
                    () => users.id,
                    {
                        onDelete: "restrict",
                    },
                ),

            isPublished: boolean(
                "is_published",
            )
                .default(true)
                .notNull(),

            publishedAt:
                timestamp("published_at"),

            createdAt:
                timestamp("created_at")
                    .defaultNow()
                    .notNull(),

            updatedAt:
                timestamp("updated_at")
                .defaultNow()
                .$onUpdate(
                    () => new Date(),
                )
                .notNull(),
        },

        (table) => [
            index(
                "corporate_announcements_published_idx",
            ).on(
                table.isPublished,
                table.publishedAt,
            ),

            index(
                "corporate_announcements_created_by_idx",
            ).on(table.createdBy),

            index(
                "corporate_announcements_created_at_idx",
            ).on(table.createdAt),
        ],
    );