export interface MembershipBenefit {
    title: string;
    description: string;
}

export interface MembershipRequirement {
    title: string;
    description: string;
}

export interface OrderQuota {
    timeUnit: string;
    orderQuota: number;
    totalOrderRevenue: number;
}

export interface InvitationCommission {
    method: string;
    rate: string;
    incomeAmount: number;
}

export interface OrderCommission {
    completionFrom: string;
    ratio: string;
    incomeAmount: number;
}

export interface MembershipTier {
    id: string;

    name: string;
    slug: string;
    description: string;

    sortOrder: number;

    isActive: boolean;
    isInternship: boolean;
    canUpgradeTo: boolean;

    isCurrent?: boolean;
    isLocked?: boolean;

    upgradePrice: string;
    lifetimeOrderLimit: number | null;

    /**
     * NEW DESIGN FIELDS
     */
    badgeStars: number;
    badgeColor: string;

    dailyOrderQuota: number;
    dailyOrderRevenue: string;

    benefits: MembershipBenefit[];

    requirements: MembershipRequirement[];

    invitationCommissionLevel1: string;
    invitationCommissionLevel2: string;
    invitationCommissionLevel3: string;

    orderCommissionLevel1: string;
    orderCommissionLevel2: string;
    orderCommissionLevel3: string;

    createdAt: string;
    updatedAt: string;
}