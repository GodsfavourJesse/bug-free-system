import {
    pgTable,
    uuid,
    varchar,
    text,
    boolean,
    timestamp,
    jsonb,
    index,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { NotificationType } from "@/database/enums/notification.enum";

export const notifications = pgTable(
    "notifications",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        /**
         * Recipient of the notification.
         */
        userId: uuid("user_id")
            .notNull()
            .references(
                () => users.id,
                {
                    onDelete: "cascade",
                },
            ),

        /**
         * Notification category.
         */
        type: varchar("type", {
            length: 50,
            enum: Object.values(
                NotificationType,
            ) as [
                NotificationType,
                ...NotificationType[],
            ],
        }).notNull(),

        /**
         * Short notification title.
         */
        title: varchar("title", {
            length: 150,
        }).notNull(),

        /**
         * Notification message.
         */
        message: text("message").notNull(),

        /**
         * Extra information.
         *
         * Examples:
         * {
         *   upgradeRequestId: "...",
         *   withdrawalId: "...",
         *   commissionId: "..."
         * }
         */
        metadata: jsonb("metadata"),

        /**
         * Whether the notification
         * has been read.
         */
        isRead: boolean("is_read")
            .default(false)
            .notNull(),

        /**
         * When the notification
         * was read.
         */
        readAt: timestamp("read_at"),

        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        userIdx: index(
            "notifications_user_idx",
        ).on(table.userId),

        typeIdx: index(
            "notifications_type_idx",
        ).on(table.type),

        readIdx: index(
            "notifications_read_idx",
        ).on(table.isRead),

        createdAtIdx: index(
            "notifications_created_at_idx",
        ).on(table.createdAt),
    }),
);