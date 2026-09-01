import {
    pgTable,
    uuid,
    timestamp,
    uniqueIndex,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import {
    corporateAnnouncements,
} from "./corporateAnnouncements";

export const corporateAnnouncementReads =
    pgTable(
        "corporate_announcement_reads",
        {
            id: uuid("id")
                .defaultRandom()
                .primaryKey(),

            announcementId: uuid(
                "announcement_id",
            )
                .notNull()
                .references(
                    () =>
                        corporateAnnouncements.id,
                    {
                        onDelete: "cascade",
                    },
                ),

            userId: uuid("user_id")
                .notNull()
                .references(
                    () => users.id,
                    {
                        onDelete: "cascade",
                    },
                ),

            readAt:
                timestamp("read_at")
                    .defaultNow()
                    .notNull(),
        },

        (table) => [
            uniqueIndex(
                "corporate_announcement_user_unique",
            ).on(
                table.announcementId,
                table.userId,
            ),
        ],
    );