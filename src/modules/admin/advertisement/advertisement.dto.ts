import { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { advertisements } from "../../../database/schema";

/**
 * Advertisement model returned from the database.
 */
export type Advertisement =
    InferSelectModel<typeof advertisements>;

/**
 * DTO used when creating a new advertisement.
 *
 * Fields with database defaults (id, createdAt, updatedAt,
 * viewCount, completionCount, etc.) are automatically optional.
 */
export type CreateAdvertisementDto =
    InferInsertModel<typeof advertisements>;

/**
 * DTO used when updating an advertisement.
 *
 * Every field is optional since updates are partial.
 */
export type UpdateAdvertisementDto =
    Partial<CreateAdvertisementDto>;