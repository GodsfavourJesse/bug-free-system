import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    integer,
    boolean,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { pgEnum } from "drizzle-orm/pg-core";

export const supportConversationStatusEnum =
    pgEnum(
        "support_conversation_status",
        [
            "open",
            "closed",
        ],
    );

export const supportConversations = pgTable(
    "support_conversations",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        userId: uuid("user_id")
            .notNull()
            .references(
                () => users.id,
                {
                    onDelete: "cascade",
                },
            ),

        status:
            supportConversationStatusEnum(
                "status",
            )
                .default("open")
                .notNull(),

        lastMessageAt:
            timestamp("last_message_at")
                .defaultNow()
                .notNull(),

        userUnreadCount:
            integer("user_unread_count")
                .default(0)
                .notNull(),

        adminUnreadCount:
            integer("admin_unread_count")
                .default(0)
                .notNull(),

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
        uniqueIndex(
            "support_conversations_user_unique",
        ).on(table.userId),

        index(
            "support_conversations_status_idx",
        ).on(table.status),

        index(
            "support_conversations_last_message_idx",
        ).on(table.lastMessageAt),

        index(
            "support_conversations_user_idx",
        ).on(table.userId),
    ],
);