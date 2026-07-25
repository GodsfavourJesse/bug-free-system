import { and, eq } from "drizzle-orm";

import { db } from "@/database";
import { dailyOrderConfigs } from "@/database/schema";
import { DbExecutor } from "@/database/types/types";

export class DailyOrderConfigRepository {

    // Create a configuration.
    async create(
        executor: DbExecutor = db,
        data: typeof dailyOrderConfigs.$inferInsert,
    ) {
        const [config] = await executor
            .insert(dailyOrderConfigs)
            .values(data)
            .returning();

        return config;
    }

    // Find configuration by ID.
    async findById(
        executor: DbExecutor = db,
        id: string,
    ) {
        const [config] = await executor
            .select()
            .from(dailyOrderConfigs)
            .where(
                eq(
                    dailyOrderConfigs.id,
                    id,
                ),
            )
            .limit(1);

        return config ?? null;
    }

    // Find the active configuration
    // for a membership plan.
    async findByMembershipPlanId(
        executor: DbExecutor = db,
        membershipPlanId: string,
    ) {
        const [config] = await executor
            .select()
            .from(dailyOrderConfigs)
            .where(
                and(
                    eq(
                        dailyOrderConfigs.membershipPlanId,
                        membershipPlanId,
                    ),
                    eq(
                        dailyOrderConfigs.isActive,
                        true,
                    ),
                ),
            )
            .limit(1);

        return config ?? null;
    }

    // Return every configuration.
    async findAll(
        executor: DbExecutor = db,
    ) {
        return executor
            .select()
            .from(dailyOrderConfigs);
    }

    // Enable / Disable configuration.
    async updateStatus(
        executor: DbExecutor = db,
        id: string,
        isActive: boolean,
    ) {
        const [config] = await executor
            .update(dailyOrderConfigs)
            .set({
                isActive,
            })
            .where(
                eq(
                    dailyOrderConfigs.id,
                    id,
                ),
            )
            .returning();

        return config ?? null;
    }

    // Update configuration.
    async update(
        executor: DbExecutor = db,
        id: string,
        data: Partial<
            typeof dailyOrderConfigs.$inferInsert
        >,
    ) {
        const [config] = await executor
            .update(dailyOrderConfigs)
            .set(data)
            .where(
                eq(
                    dailyOrderConfigs.id,
                    id,
                ),
            )
            .returning();

        return config ?? null;
    }

    // Delete configuration.
    async delete(
        executor: DbExecutor = db,
        id: string,
    ) {
        const [config] = await executor
            .delete(dailyOrderConfigs)
            .where(
                eq(
                    dailyOrderConfigs.id,
                    id,
                ),
            )
            .returning();

        return config ?? null;
    }
}

export const dailyOrderConfigRepository =
    new DailyOrderConfigRepository();