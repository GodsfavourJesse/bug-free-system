import { users } from "../../database/schema";

// User database type.
export type User = typeof users.$inferSelect;

// Minimal membership representation returned by authentication/profile endpoints. 
// Detailed membership information should be retrieved from the membership endpoints.

export interface Membership {
    id: string;
    name: string;
    slug: string;

    isActive: boolean;
    isInternship: boolean;
    canUpgradeTo: boolean;

    sortOrder: number;
    description: string | null;
    upgradePrice: string;

    invitationCommissionLevel1: string;
    invitationCommissionLevel2: string;
    invitationCommissionLevel3: string;

    orderCommissionLevel1: string;
    orderCommissionLevel2: string;
    orderCommissionLevel3: string;

    // tasksPerDay: number | null;
    // rewardPerTask: string | null;
    // dailyRewardLimit: string | null;
}

/**
 * User together with membership information.
 *
 * This is the shape expected by the user mapper.
 */
export interface UserWithMembership {
    user: User;
    membership: Membership | null;
}