import {
    pgTable,
    uuid,
    varchar,
    text,
    integer,
    timestamp,
    pgEnum,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const advertisementStatusEnum = pgEnum(
    "advertisement_status",
    [
        "draft",
        "active",
        "inactive",
        "scheduled",
        "expired",
    ],
);

export const advertisements = pgTable(
    "advertisements",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        /**
         * Product name
         * Example:
         * iPhone 17 Pro
         */
        title: varchar("title", {
            length: 255,
        }).notNull(),

        /**
         * URL slug
         * iphone-17-pro
         */
        slug: varchar("slug", {
            length: 255,
        })
            .unique()
            .notNull(),

        /**
         * Short description shown
         * inside task list.
         */
        shortDescription: text(
            "short_description",
        ).notNull(),

        /**
         * Full product description.
         */
        fullDescription: text(
            "full_description",
        ).notNull(),

        /**
         * Small image.
         */
        thumbnailUrl: text(
            "thumbnail_url",
        ).notNull(),

        /**
         * Banner image.
         */
        bannerUrl: text(
            "banner_url",
        ),

        /**
         * Example:
         * Learn More
         * Shop Now
         * Buy Now
         */
        buttonText: varchar(
            "button_text",
            {
                length: 80,
            },
        )
            .default("Learn More")
            .notNull(),

        /**
         * External product URL.
         */
        targetUrl: text(
            "target_url",
        ).notNull(),

        /**
         * Electronics
         * Fashion
         * Crypto
         */
        category: varchar(
            "category",
            {
                length: 120,
            },
        ).notNull(),

        /**
         * Higher priority
         * advertisements appear first.
         */
        priority: integer(
            "priority",
        )
            .default(0)
            .notNull(),

        /**
         * Advertisement lifecycle.
         */
        status:
            advertisementStatusEnum(
                "status",
            )
                .default("draft")
                .notNull(),

        /**
         * Campaign starts.
         */
        startDate: timestamp(
            "start_date",
        ),

        /**
         * Campaign ends.
         */
        endDate: timestamp(
            "end_date",
        ),

        /**
         * Number of users
         * that opened this advertisement.
         */
        viewCount: integer(
            "view_count",
        )
            .default(0)
            .notNull(),

        /**
         * Number of users
         * that completed the task.
         */
        completionCount: integer(
            "completion_count",
        )
            .default(0)
            .notNull(),

        /**
         * Admin that created it.
         */
        createdBy: uuid(
            "created_by",
        )
            .references(
                () => users.id,
            )
            .notNull(),

        createdAt: timestamp(
            "created_at",
        )
            .defaultNow()
            .notNull(),

        updatedAt: timestamp(
            "updated_at",
        )
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
);