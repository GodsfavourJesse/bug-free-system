import { and, desc, eq } from "drizzle-orm";

import { db } from "../../../database";
import { DbExecutor } from "../../../database/types/types";

import {
    dailyOrderConfigs,
    membershipPlans,
} from "../../../database/schema";

export class DailyOrderConfigRepository {

    /**
     * Create configuration.
     */
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

    /**
     * Return every configuration.
     */
    async findAll(
        executor: DbExecutor = db,
    ) {
        return executor
            .select({
                id: dailyOrderConfigs.id,

                membershipPlanId:
                    dailyOrderConfigs.membershipPlanId,

                tasksPerDay:
                    dailyOrderConfigs.tasksPerDay,

                rewardPerTask:
                    dailyOrderConfigs.rewardPerTask,

                dailyRewardLimit:
                    dailyOrderConfigs.dailyRewardLimit,

                isActive:
                    dailyOrderConfigs.isActive,

                createdAt:
                    dailyOrderConfigs.createdAt,

                updatedAt:
                    dailyOrderConfigs.updatedAt,

                membershipPlan: {
                    id: membershipPlans.id,
                    name: membershipPlans.name,
                },
            })
            .from(dailyOrderConfigs)
            .leftJoin(
                membershipPlans,
                eq(
                    dailyOrderConfigs.membershipPlanId,
                    membershipPlans.id,
                ),
            );
    }

    /**
     * Find one configuration.
     */
    async findById(
        executor: DbExecutor = db,
        id: string,
    ) {
        const [config] =
            await executor
                .select({
                    id: dailyOrderConfigs.id,

                    membershipPlanId:
                        dailyOrderConfigs.membershipPlanId,

                    tasksPerDay:
                        dailyOrderConfigs.tasksPerDay,

                    rewardPerTask:
                        dailyOrderConfigs.rewardPerTask,

                    dailyRewardLimit:
                        dailyOrderConfigs.dailyRewardLimit,

                    isActive:
                        dailyOrderConfigs.isActive,

                    createdAt:
                        dailyOrderConfigs.createdAt,

                    updatedAt:
                        dailyOrderConfigs.updatedAt,

                    membershipPlan: {
                        id: membershipPlans.id,
                        name: membershipPlans.name,
                    },
                })
                .from(dailyOrderConfigs)
                .leftJoin(
                    membershipPlans,
                    eq(
                        dailyOrderConfigs.membershipPlanId,
                        membershipPlans.id,
                    ),
                )
                .where(
                    eq(
                        dailyOrderConfigs.id,
                        id,
                    ),
                )
                .limit(1);

        return config ?? null;
    }

    /**
     * Find active configuration for a plan.
     */
    async findByMembershipPlanId(
        executor: DbExecutor = db,
        membershipPlanId: string,
    ) {
        const [config] =
            await executor
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

    /**
     * Update configuration.
     */
    async update(
        executor: DbExecutor = db,
        id: string,
        data: Partial<
            typeof dailyOrderConfigs.$inferInsert
        >,
    ) {
        const [config] =
            await executor
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

    /**
     * Activate/Deactivate.
     */
    async updateStatus(
        executor: DbExecutor = db,
        id: string,
        isActive: boolean,
    ) {
        const [config] =
            await executor
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

    /**
     * Delete configuration.
     */
    async delete(
        executor: DbExecutor = db,
        id: string,
    ) {
        const [config] =
            await executor
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