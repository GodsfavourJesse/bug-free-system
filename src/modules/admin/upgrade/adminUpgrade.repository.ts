import {
    desc,
    eq,
} from "drizzle-orm";

import { db } from "../../../database";
import { DbExecutor } from "../../../database/types/types";

import {
    membershipPlans,
    upgradeRequests,
    users,
} from "../../../database/schema";
import { aliasedTable } from "drizzle-orm";

const requestedMembershipPlans = aliasedTable(
    membershipPlans,
    "requested_membership_plans",
);

export class AdminUpgradeRepository {
    

    /**
     * Return all upgrade requests with
     * user and membership information.
     */
    async findAll(
        executor: DbExecutor = db,
    ) {
        return executor
            .select({
                request: upgradeRequests,

                user: {
                    id: users.id,
                    email: users.email,
                    phone: users.phone,
                    referralCode:
                        users.referralCode,
                },

                currentMembershipPlan: {
                    id: membershipPlans.id,
                    name: membershipPlans.name,
                    slug: membershipPlans.slug,
                },

                requestedMembershipPlan: {
                    id: requestedMembershipPlans.id,
                    name: requestedMembershipPlans.name,
                    slug: requestedMembershipPlans.slug,
                },
            })
            .from(upgradeRequests)

            .leftJoin(
                users,
                eq(
                    upgradeRequests.userId,
                    users.id,
                ),
            )

            .leftJoin(
                membershipPlans,
                eq(
                    upgradeRequests.currentMembershipPlanId,
                    membershipPlans.id,
                ),
            )

            .leftJoin(
                requestedMembershipPlans,
                eq(
                    upgradeRequests.requestedMembershipPlanId,
                    requestedMembershipPlans.id,
                ),
            )

            .orderBy(
                desc(
                    upgradeRequests.createdAt,
                ),
            );
    }

    /**
     * Return one upgrade request with
     * user and membership information.
     */
    async findById(
        executor: DbExecutor = db,
        id: string,
    ) {
        const [request] = await executor
            .select({
                request: upgradeRequests,

                user: {
                    id: users.id,
                    email: users.email,
                    phone: users.phone,
                    referralCode:
                        users.referralCode,
                },

                currentMembershipPlan: {
                    id: membershipPlans.id,
                    name: membershipPlans.name,
                    slug: membershipPlans.slug,
                },

                requestedMembershipPlan: {
                    id: requestedMembershipPlans.id,
                    name: requestedMembershipPlans.name,
                    slug: requestedMembershipPlans.slug,
                },
            })
            .from(upgradeRequests)

            .leftJoin(
                users,
                eq(
                    upgradeRequests.userId,
                    users.id,
                ),
            )

            .leftJoin(
                membershipPlans,
                eq(
                    upgradeRequests.currentMembershipPlanId,
                    membershipPlans.id,
                ),
            )

            .leftJoin(
                requestedMembershipPlans,
                eq(
                    upgradeRequests.requestedMembershipPlanId,
                    requestedMembershipPlans.id,
                ),
            )

            .where(
                eq(
                    upgradeRequests.id,
                    id,
                ),
            )
            .limit(1);

        return request ?? null;
    }
}

export const adminUpgradeRepository =
    new AdminUpgradeRepository();