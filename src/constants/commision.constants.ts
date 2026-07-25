// Commission Configuration
// Defines referral commission percentages.
// Values are expressed as decimal fractions.

// Example:
// 0.10 = 10%
// 0.05 = 5%
export const COMMISSION_RATES = {
    LEVEL_1: 0.10,
    LEVEL_2: 0.05,
    LEVEL_3: 0.03,
} as const;

// Maximum referral levels eligible
// for commission payouts.
export const MAX_COMMISSION_LEVEL = 3;

// Commission sources.
// Used for transaction metadata.
export const COMMISSION_SOURCES = {
    MEMBERSHIP_PURCHASE: "membership_purchase",

    MEMBERSHIP_UPGRADE: "membership_upgrade",
} as const;

export type CommissionSource =
    (typeof COMMISSION_SOURCES)[keyof typeof COMMISSION_SOURCES];