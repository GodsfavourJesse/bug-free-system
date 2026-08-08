import { eq } from "drizzle-orm";

import { db } from "../../database";
import { users } from "../../database/schema";

import { membershipPlanRepository } from "./membershipPlan.repository";
import { membershipPlanValidation } from "./membershipPlan.validation";

export class MembershipPlanService {

    // ============================================================
    // PUBLIC
    // ============================================================

    /**
     * Returns the membership catalog shown
     * in the Membership Center.
     */
    async getMembershipCatalog() {
        return membershipPlanRepository.findMembershipCatalog(
            db,
        );
    }

    /**
     * Returns every membership plan.
     */
    async getPlans() {
        return membershipPlanRepository.findAll(
            db,
        );
    }

    /**
     * Returns one membership using its ID.
     */
    async getPlan(
        id: string,
    ) {
        const plan =
            await membershipPlanRepository.findById(
                db,
                id,
            );

        return membershipPlanValidation.ensureMembershipPlanExists(
            plan,
        );
    }

    /**
     * Returns one membership using its slug.
     */
    async getPlanBySlug(
        slug: string,
    ) {
        const plan =
            await membershipPlanRepository.findBySlug(
                db,
                slug,
            );

        return membershipPlanValidation.ensureMembershipPlanExists(
            plan,
        );
    }

    // ============================================================
    // USER
    // ============================================================

    /**
     * Returns the user's current membership.
     */
    async getCurrentPlan(
        userId: string,
    ) {
        const [user] = await db
            .select({
                membershipPlanId:
                    users.membershipPlanId,
            })
            .from(users)
            .where(
                eq(users.id, userId),
            )
            .limit(1);

        if (!user) {
            throw new Error(
                "User not found.",
            );
        }

        if (!user.membershipPlanId) {
            throw new Error(
                "User has no membership plan.",
            );
        }

        return this.getPlan(
            user.membershipPlanId,
        );
    }

    /**
     * Returns the next upgrade available
     * for the current user.
     */
    async getNextPlan(
        userId: string,
    ) {
        const currentPlan =
            await this.getCurrentPlan(
                userId,
            );

        const highestPlan =
            membershipPlanValidation.ensureMembershipPlanExists(
                await membershipPlanRepository.findHighest(
                    db,
                ),
            );

        membershipPlanValidation.ensureNotHighestPlan(
            currentPlan,
            highestPlan,
        );

        const nextPlan =
            membershipPlanValidation.ensureMembershipPlanExists(
                await membershipPlanRepository.findNext(
                    db,
                    currentPlan.sortOrder,
                ),
            );

        membershipPlanValidation.ensureMembershipPlanIsActive(
            nextPlan,
        );

        membershipPlanValidation.ensureCanUpgradeTo(
            nextPlan,
        );

        return nextPlan;
    }

    // ============================================================
    // ADMIN
    // ============================================================

    /**
     * Phase M7
     */
    async createPlan() {
        throw new Error(
            "Not implemented.",
        );
    }

    /**
     * Phase M7
     */
    async updatePlan() {
        throw new Error(
            "Not implemented.",
        );
    }

    /**
     * Phase M7
     */
    async disablePlan() {
        throw new Error(
            "Not implemented.",
        );
    }

    /**
     * Phase M7
     */
    async enablePlan() {
        throw new Error(
            "Not implemented.",
        );
    }
}

export const membershipPlanService =
    new MembershipPlanService();