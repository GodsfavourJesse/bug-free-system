import {
    and,
    asc,
    desc,
    eq,
    gt,
    lt,
} from "drizzle-orm";

import { db } from "@/database";
import { membershipPlans } from "@/database/schema";
import { DbExecutor } from "@/database/types/types";

export class MembershipPlanRepository {

    /**
     * Find membership plan by ID.
     */
    async findById(
        executor: DbExecutor = db,
        id: string,
    ) {
        const [plan] = await executor
            .select()
            .from(membershipPlans)
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
     * Find membership plan by slug.
     */
    async findBySlug(
        executor: DbExecutor = db,
        slug: string,
    ) {
        const [plan] = await executor
            .select()
            .from(membershipPlans)
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
     * Returns every membership plan.
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
     * Returns plans users can currently join.
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
     * Returns the internship membership.
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
     * Returns the highest membership.
     */
    async findHighest(
        executor: DbExecutor = db,
    ) {
        const [plan] = await executor
            .select()
            .from(membershipPlans)
            .orderBy(
                desc(
                    membershipPlans.sortOrder,
                ),
            )
            .limit(1);

        return plan ?? null;
    }

    /**
     * Returns the next membership
     * available for upgrade.
     *
     * Skips inactive plans.
     * Skips plans that cannot
     * currently receive upgrades.
     */
    async findNext(
        executor: DbExecutor = db,
        currentSortOrder: number,
    ) {
        const [plan] = await executor
            .select()
            .from(membershipPlans)
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
     * Returns the previous
     * active membership.
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
}

export const membershipPlanRepository =
    new MembershipPlanRepository();