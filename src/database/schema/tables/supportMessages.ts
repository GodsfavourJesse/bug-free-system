import {
    pgTable,
    uuid,
    text,
    timestamp,
    boolean,
    index,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import {
    supportConversations,
} from "./supportConversations";
import { pgEnum } from "drizzle-orm/pg-core";

export const supportMessageSenderEnum =
    pgEnum(
        "support_message_sender",
        [
            "user",
            "admin",
        ],
    );

export const supportMessages = pgTable(
    "support_messages",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        conversationId: uuid(
            "conversation_id",
        )
            .notNull()
            .references(
                () =>
                    supportConversations.id,
                {
                    onDelete: "cascade",
                },
            ),

        senderId: uuid("sender_id")
            .notNull()
            .references(
                () => users.id,
                {
                    onDelete: "cascade",
                },
            ),

        senderType:
            supportMessageSenderEnum(
                "sender_type",
            )
                .notNull(),

        message: text("message")
            .notNull(),

        isRead: boolean("is_read")
            .default(false)
            .notNull(),

        readAt: timestamp("read_at"),

        createdAt:
            timestamp("created_at")
                .defaultNow()
                .notNull(),
    },

    (table) => [
        index(
            "support_messages_conversation_idx",
        ).on(table.conversationId),

        index(
            "support_messages_sender_idx",
        ).on(table.senderId),

        index(
            "support_messages_created_at_idx",
        ).on(table.createdAt),

        index(
            "support_messages_read_idx",
        ).on(table.isRead),
    ],
);