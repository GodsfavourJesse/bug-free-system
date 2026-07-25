import {
    HighestMembershipPlanError,
    InvalidMembershipUpgradeError,
    MembershipPlanInactiveError,
    MembershipPlanNotFoundError,
    MembershipPlanNotUpgradeableError,
} from "./membershipPlan.errors";

export class MembershipPlanValidation {

    /**
     * Ensures a membership plan exists.
     */
    ensureMembershipPlanExists<T>(
        plan: T | null,
    ): T {
        if (!plan) {
            throw new MembershipPlanNotFoundError();
        }

        return plan;
    }

    /**
     * Ensures the membership plan is active.
     */
    ensureMembershipPlanIsActive(
        plan: {
            isActive: boolean;
        },
    ) {
        if (!plan.isActive) {
            throw new MembershipPlanInactiveError();
        }
    }

    // Ensures users can upgrade into this plan.
    ensureCanUpgradeTo(
        plan: {
            canUpgradeTo: boolean;
        },
    ) {
        if (!plan.canUpgradeTo) {
            throw new MembershipPlanNotUpgradeableError();
        }
    }

    /**
     * Ensures the current plan is not already
     * the highest plan.
     */
    ensureNotHighestPlan(
        currentPlan: {
            id: string;
        },
        highestPlan: {
            id: string;
        },
    ) {
        if (currentPlan.id === highestPlan.id) {
            throw new HighestMembershipPlanError();
        }
    }

    /**
     * Ensures the requested plan can be upgraded to.
     */
    ensureUpgradeable(
        currentPlan: {
            id: string;
        },
        requestedPlan: {
            id: string;
            isActive: boolean;
            canUpgradeTo: boolean;
        },
    ) {
        if (
            currentPlan.id ===
            requestedPlan.id
        ) {
            throw new InvalidMembershipUpgradeError(
                "Cannot upgrade to the current membership plan.",
            );
        }

        this.ensureMembershipPlanIsActive(
            requestedPlan,
        );

        this.ensureCanUpgradeTo(
            requestedPlan,
        );
    }

    /**
     * Ensures upgrades follow the correct sequence.
     *
     * Internship → 1 Star ✔
     * 1 Star → 2 Star ✔
     * 1 Star → VIP ✘
     */
    ensurePlanSequence(
        currentPlan: {
            sortOrder: number;
        },
        requestedPlan: {
            sortOrder: number;
        },
    ) {
        if (
            requestedPlan.sortOrder !==
            currentPlan.sortOrder + 1
        ) {
            throw new InvalidMembershipUpgradeError(
                "Membership upgrades must follow the next available plan.",
            );
        }
    }
}

export const membershipPlanValidation =
    new MembershipPlanValidation();