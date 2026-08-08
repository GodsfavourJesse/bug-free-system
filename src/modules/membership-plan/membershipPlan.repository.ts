import {
    and,
    asc,
    desc,
    eq,
    gt,
    lt,
} from "drizzle-orm";

import { db } from "../../database";
import { DbExecutor } from "../../database/types/types";

import {
    membershipPlans,
    dailyOrderConfigs,
} from "../../database/schema";

export class MembershipPlanRepository {

    /**
     * Find membership by ID.
     *
     * Includes daily order configuration.
     */
    async findById(
        executor: DbExecutor = db,
        id: string,
    ) {
        const [plan] = await executor
            .select({
                id: membershipPlans.id,
                slug: membershipPlans.slug,
                name: membershipPlans.name,

                sortOrder: membershipPlans.sortOrder,

                description: membershipPlans.description,

                upgradePrice:
                    membershipPlans.upgradePrice,

                invitationCommissionLevel1:
                    membershipPlans.invitationCommissionLevel1,

                invitationCommissionLevel2:
                    membershipPlans.invitationCommissionLevel2,

                invitationCommissionLevel3:
                    membershipPlans.invitationCommissionLevel3,

                orderCommissionLevel1:
                    membershipPlans.orderCommissionLevel1,

                orderCommissionLevel2:
                    membershipPlans.orderCommissionLevel2,

                orderCommissionLevel3:
                    membershipPlans.orderCommissionLevel3,

                isInternship:
                    membershipPlans.isInternship,

                canUpgradeTo:
                    membershipPlans.canUpgradeTo,

                isActive: membershipPlans.isActive,

                // Daily order configuration
                tasksPerDay:
                    dailyOrderConfigs.tasksPerDay,

                rewardPerTask:
                    dailyOrderConfigs.rewardPerTask,

                dailyRewardLimit:
                    dailyOrderConfigs.dailyRewardLimit,
            })
            .from(membershipPlans)
            .leftJoin(
                dailyOrderConfigs,
                eq(
                    dailyOrderConfigs.membershipPlanId,
                    membershipPlans.id,
                ),
            )
            .where(
                eq(
                    membershipPlans.id,
                    id,
                ),
            )
            .limit(1);

        return plan ?? null;
    }

    /**
     * Find membership by slug.
     *
     * Includes daily order configuration.
     */
    async findBySlug(
        executor: DbExecutor = db,
        slug: string,
    ) {
        const [plan] = await executor
            .select({
                id: membershipPlans.id,
                slug: membershipPlans.slug,
                name: membershipPlans.name,

                sortOrder: membershipPlans.sortOrder,

                description: membershipPlans.description,

                upgradePrice:
                    membershipPlans.upgradePrice,

                invitationCommissionLevel1:
                    membershipPlans.invitationCommissionLevel1,

                invitationCommissionLevel2:
                    membershipPlans.invitationCommissionLevel2,

                invitationCommissionLevel3:
                    membershipPlans.invitationCommissionLevel3,

                orderCommissionLevel1:
                    membershipPlans.orderCommissionLevel1,

                orderCommissionLevel2:
                    membershipPlans.orderCommissionLevel2,

                orderCommissionLevel3:
                    membershipPlans.orderCommissionLevel3,

                isInternship:
                    membershipPlans.isInternship,

                canUpgradeTo:
                    membershipPlans.canUpgradeTo,

                // Daily order configuration
                tasksPerDay:
                    dailyOrderConfigs.tasksPerDay,

                rewardPerTask:
                    dailyOrderConfigs.rewardPerTask,

                dailyRewardLimit:
                    dailyOrderConfigs.dailyRewardLimit,
            })
            .from(membershipPlans)
            .leftJoin(
                dailyOrderConfigs,
                eq(
                    dailyOrderConfigs.membershipPlanId,
                    membershipPlans.id,
                ),
            )
            .where(
                eq(
                    membershipPlans.slug,
                    slug,
                ),
            )
            .limit(1);

        return plan ?? null;
    }

    /**
     * Returns every membership.
     */
    async findAll(
        executor: DbExecutor = db,
    ) {
        return executor
            .select()
            .from(membershipPlans)
            .orderBy(
                asc(
                    membershipPlans.sortOrder,
                ),
            );
    }

    /**
     * Returns only active memberships.
     */
    async findActive(
        executor: DbExecutor = db,
    ) {
        return executor
            .select()
            .from(membershipPlans)
            .where(
                eq(
                    membershipPlans.isActive,
                    true,
                ),
            )
            .orderBy(
                asc(
                    membershipPlans.sortOrder,
                ),
            );
    }

    /**
     * Internship membership.
     */
    async findInternship(
        executor: DbExecutor = db,
    ) {
        const [plan] = await executor
            .select()
            .from(membershipPlans)
            .where(
                eq(
                    membershipPlans.isInternship,
                    true,
                ),
            )
            .limit(1);

        return plan ?? null;
    }

    /**
     * Highest membership.
     */
    async findHighest(
        executor: DbExecutor = db,
    ) {
        const [plan] = await executor
            .select()
            .from(membershipPlans)
            .where(
                eq(
                    membershipPlans.isActive,
                    true,
                ),
            )
            .orderBy(
                desc(
                    membershipPlans.sortOrder,
                ),
            )
            .limit(1);

        return plan ?? null;
    }

    /**
     * Next upgradeable membership.
     */
    async findNext(
        executor: DbExecutor = db,
        currentSortOrder: number,
    ) {
        const [plan] = await executor
            .select({
                id: membershipPlans.id,
                slug: membershipPlans.slug,
                name: membershipPlans.name,

                sortOrder: membershipPlans.sortOrder,

                description: membershipPlans.description,

                upgradePrice:
                    membershipPlans.upgradePrice,

                invitationCommissionLevel1:
                    membershipPlans.invitationCommissionLevel1,

                invitationCommissionLevel2:
                    membershipPlans.invitationCommissionLevel2,

                invitationCommissionLevel3:
                    membershipPlans.invitationCommissionLevel3,

                orderCommissionLevel1:
                    membershipPlans.orderCommissionLevel1,

                orderCommissionLevel2:
                    membershipPlans.orderCommissionLevel2,

                orderCommissionLevel3:
                    membershipPlans.orderCommissionLevel3,

                isInternship:
                    membershipPlans.isInternship,

                canUpgradeTo:
                    membershipPlans.canUpgradeTo,

                isActive:
                    membershipPlans.isActive,

                // Daily order configuration
                tasksPerDay:
                    dailyOrderConfigs.tasksPerDay,

                rewardPerTask:
                    dailyOrderConfigs.rewardPerTask,

                dailyRewardLimit:
                    dailyOrderConfigs.dailyRewardLimit,
            })
            .from(membershipPlans)
            .leftJoin(
                dailyOrderConfigs,
                eq(
                    dailyOrderConfigs.membershipPlanId,
                    membershipPlans.id,
                ),
            )
            .where(
                and(
                    gt(
                        membershipPlans.sortOrder,
                        currentSortOrder,
                    ),

                    eq(
                        membershipPlans.isActive,
                        true,
                    ),

                    eq(
                        membershipPlans.canUpgradeTo,
                        true,
                    ),
                ),
            )
            .orderBy(
                asc(
                    membershipPlans.sortOrder,
                ),
            )
            .limit(1);

        return plan ?? null;
    }

    /**
     * Previous active membership.
     */
    async findPrevious(
        executor: DbExecutor = db,
        currentSortOrder: number,
    ) {
        const [plan] = await executor
            .select()
            .from(membershipPlans)
            .where(
                and(
                    lt(
                        membershipPlans.sortOrder,
                        currentSortOrder,
                    ),

                    eq(
                        membershipPlans.isActive,
                        true,
                    ),
                ),
            )
            .orderBy(
                desc(
                    membershipPlans.sortOrder,
                ),
            )
            .limit(1);

        return plan ?? null;
    }

    /**
     * Memberships users are allowed to upgrade into.
     */
    async findUpgradeable(
        executor: DbExecutor = db,
    ) {
        return executor
            .select()
            .from(membershipPlans)
            .where(
                and(
                    eq(
                        membershipPlans.isActive,
                        true,
                    ),

                    eq(
                        membershipPlans.canUpgradeTo,
                        true,
                    ),
                ),
            )
            .orderBy(
                asc(
                    membershipPlans.sortOrder,
                ),
            );
    }

    /**
     * Membership catalog.
     *
     * This is the main endpoint consumed by
     * the frontend Membership Center.
     *
     * Includes:
     *
     * - membership information
     * - daily tasks
     * - reward per task
     * - total daily reward
     */
    async findMembershipCatalog(
        executor: DbExecutor = db,
    ) {
        return executor
            .select({
                id: membershipPlans.id,
                slug: membershipPlans.slug,
                name: membershipPlans.name,

                sortOrder:
                    membershipPlans.sortOrder,

                description:
                    membershipPlans.description,

                upgradePrice:
                    membershipPlans.upgradePrice,

                invitationCommissionLevel1:
                    membershipPlans.invitationCommissionLevel1,

                invitationCommissionLevel2:
                    membershipPlans.invitationCommissionLevel2,

                invitationCommissionLevel3:
                    membershipPlans.invitationCommissionLevel3,

                orderCommissionLevel1:
                    membershipPlans.orderCommissionLevel1,

                orderCommissionLevel2:
                    membershipPlans.orderCommissionLevel2,

                orderCommissionLevel3:
                    membershipPlans.orderCommissionLevel3,

                isInternship:
                    membershipPlans.isInternship,

                canUpgradeTo:
                    membershipPlans.canUpgradeTo,

                // ==========================================
                // DAILY QUOTA
                // ==========================================

                tasksPerDay:
                    dailyOrderConfigs.tasksPerDay,

                rewardPerTask:
                    dailyOrderConfigs.rewardPerTask,

                dailyRewardLimit:
                    dailyOrderConfigs.dailyRewardLimit,
            })
            .from(membershipPlans)
            .leftJoin(
                dailyOrderConfigs,
                eq(
                    dailyOrderConfigs.membershipPlanId,
                    membershipPlans.id,
                ),
            )
            .where(
                eq(
                    membershipPlans.isActive,
                    true,
                ),
            )
            .orderBy(
                asc(
                    membershipPlans.sortOrder,
                ),
            );
    }
}

export const membershipPlanRepository =
    new MembershipPlanRepository();