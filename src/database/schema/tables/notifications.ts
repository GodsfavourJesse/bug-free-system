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

import {
    NotificationType,
} from "../../enums/notification.enum";

export const notifications =
    pgTable(
        "notifications",
        {
            id: uuid("id")
                .defaultRandom()
                .primaryKey(),

            userId: uuid("user_id")
                .notNull()
                .references(
                    () => users.id,
                    {
                        onDelete:
                            "cascade",
                    },
                ),

            type: varchar(
                "type",
                {
                    length: 50,
                    enum:
                        Object.values(
                            NotificationType,
                        ) as [
                            NotificationType,
                            ...NotificationType[],
                        ],
                },
            ).notNull(),

            title: varchar(
                "title",
                {
                    length: 150,
                },
            ).notNull(),

            message: text(
                "message",
            ).notNull(),

            metadata: jsonb(
                "metadata",
            ),

            isRead: boolean(
                "is_read",
            )
                .default(false)
                .notNull(),

            readAt: timestamp(
                "read_at",
            ),

            createdAt:
                timestamp(
                    "created_at",
                )
                    .defaultNow()
                    .notNull(),
        },

        (table) => ({
            userIdx:
                index(
                    "notifications_user_idx",
                ).on(
                    table.userId,
                ),

            userCreatedIdx:
                index(
                    "notifications_user_created_idx",
                ).on(
                    table.userId,
                    table.createdAt,
                ),

            userReadIdx:
                index(
                    "notifications_user_read_idx",
                ).on(
                    table.userId,
                    table.isRead,
                ),

            typeIdx:
                index(
                    "notifications_type_idx",
                ).on(
                    table.type,
                ),

            createdAtIdx:
                index(
                    "notifications_created_at_idx",
                ).on(
                    table.createdAt,
                ),
        }),
    );