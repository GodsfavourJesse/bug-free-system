import {
    asc,
    desc,
    eq,
    InferInsertModel,
    sql,
} from "drizzle-orm";

import { DbExecutor } from "../../../database/types/types";
import { db } from "../../../database";
import { advertisements } from "../../../database/schema";
import { AdvertisementStatus } from "../../../database/enums/advertisement.enum";

export type CreateAdvertisementDto =
    InferInsertModel<typeof advertisements>;

export type UpdateAdvertisementDto =
    Partial<CreateAdvertisementDto>;

export class AdvertisementRepository {

    async create(
        executor: DbExecutor = db,
        dto: CreateAdvertisementDto,
    ) {
        const [advertisement] = await executor
            .insert(advertisements)
            .values(dto)
            .returning();

        return advertisement;
    }

    async findAll(
        executor: DbExecutor = db,
    ) {
        return executor
            .select()
            .from(advertisements)
            .orderBy(
                desc(advertisements.priority),
                desc(advertisements.createdAt),
            );
    }

    async findById(
        executor: DbExecutor = db,
        advertisementId: string,
    ) {
        const [advertisement] = await executor
            .select()
            .from(advertisements)
            .where(
                eq(
                    advertisements.id,
                    advertisementId,
                ),
            )
            .limit(1);

        return advertisement ?? null;
    }

    async findBySlug(
        executor: DbExecutor = db,
        slug: string,
    ) {
        const [advertisement] = await executor
            .select()
            .from(advertisements)
            .where(
                eq(
                    advertisements.slug,
                    slug,
                ),
            )
            .limit(1);

        return advertisement ?? null;
    }

    async findActive(
        executor: DbExecutor = db,
    ) {
        return executor
            .select()
            .from(advertisements)
            .where(
                eq(
                    advertisements.status,
                    AdvertisementStatus.ACTIVE,
                ),
            )
            .orderBy(
                desc(advertisements.priority),
                desc(advertisements.createdAt),
            );
    }

    async findScheduled(
        executor: DbExecutor = db,
    ) {
        return executor
            .select()
            .from(advertisements)
            .where(
                eq(
                    advertisements.status,
                    AdvertisementStatus.SCHEDULED,
                ),
            )
            .orderBy(
                asc(advertisements.startDate),
            );
    }

    async findExpired(
        executor: DbExecutor = db,
    ) {
        return executor
            .select()
            .from(advertisements)
            .where(
                eq(
                    advertisements.status,
                    AdvertisementStatus.EXPIRED,
                ),
            )
            .orderBy(
                desc(advertisements.updatedAt),
            );
    }

    async findRandomAdvertisements(
        executor: DbExecutor = db,
        limit: number,
    ) {
        return executor
            .select()
            .from(advertisements)
            .where(
                eq(
                    advertisements.status,
                    AdvertisementStatus.ACTIVE,
                ),
            )
            .orderBy(sql`RANDOM()`)
            .limit(limit);
    }

    async findByCategory(
        executor: DbExecutor = db,
        category: string,
    ) {
        return executor
            .select()
            .from(advertisements)
            .where(
                eq(
                    advertisements.category,
                    category,
                ),
            )
            .orderBy(
                desc(advertisements.priority),
                desc(advertisements.createdAt),
            );
    }

    async findByStatus(
        executor: DbExecutor = db,
        status: AdvertisementStatus,
    ) {
        return executor
            .select()
            .from(advertisements)
            .where(
                eq(
                    advertisements.status,
                    status,
                ),
            )
            .orderBy(
                desc(advertisements.createdAt),
            );
    }

    async findByPriority(
        executor: DbExecutor = db,
        priority: number,
    ) {
        return executor
            .select()
            .from(advertisements)
            .where(
                eq(
                    advertisements.priority,
                    priority,
                ),
            )
            .orderBy(
                desc(advertisements.createdAt),
            );
    }

    async update(
        executor: DbExecutor = db,
        advertisementId: string,
        dto: UpdateAdvertisementDto,
    ) {
        const [advertisement] = await executor
            .update(advertisements)
            .set(dto)
            .where(
                eq(
                    advertisements.id,
                    advertisementId,
                ),
            )
            .returning();

        return advertisement;
    }

    async updateStatus(
        executor: DbExecutor = db,
        advertisementId: string,
        status: AdvertisementStatus,
    ) {
        const [advertisement] = await executor
            .update(advertisements)
            .set({
                status,
            })
            .where(
                eq(
                    advertisements.id,
                    advertisementId,
                ),
            )
            .returning();

        return advertisement;
    }

    async delete(
        executor: DbExecutor = db,
        advertisementId: string,
    ) {
        const [advertisement] = await executor
            .update(advertisements)
            .set({
                status:
                    AdvertisementStatus.INACTIVE,
            })
            .where(
                eq(
                    advertisements.id,
                    advertisementId,
                ),
            )
            .returning();

        return advertisement;
    }

    async incrementViews(
        executor: DbExecutor = db,
        advertisementId: string,
    ) {
        const [advertisement] = await executor
            .update(advertisements)
            .set({
                viewCount: sql`${advertisements.viewCount} + 1`,
            })
            .where(
                eq(
                    advertisements.id,
                    advertisementId,
                ),
            )
            .returning();

        return advertisement;
    }

    async incrementCompletions(
        executor: DbExecutor = db,
        advertisementId: string,
    ) {
        const [advertisement] = await executor
            .update(advertisements)
            .set({
                completionCount: sql`${advertisements.completionCount} + 1`,
            })
            .where(
                eq(
                    advertisements.id,
                    advertisementId,
                ),
            )
            .returning();

        return advertisement;
    }

}

export const advertisementRepository =
    new AdvertisementRepository();