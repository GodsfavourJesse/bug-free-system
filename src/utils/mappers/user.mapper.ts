import {
    UserWithMembership,
} from "./mapper.dto";

export const toUserResponse = ({
    user,
    membership,
}: UserWithMembership) => ({
    id: user.id,
    phone: user.phone,
    email: user.email,
    role: user.role,
    country: user.country,

    /**
     * Referral codes are hidden while the user
     * is still on the Internship plan.
     *
     * Once the user upgrades, the referral code
     * becomes available in the profile response.
     */
    referralCode:
        membership?.isInternship
            ? null
            : user.referralCode,

    referredBy: user.referredBy,

    isVerified: user.isVerified,
    isActive: user.isActive,

    membership: membership
        ? {
              id: membership.id,
              name: membership.name,
              slug: membership.slug,
              isActive: membership.isActive,
              isInternship:
                  membership.isInternship,
              canUpgradeTo:
                  membership.canUpgradeTo,
              sortOrder:
                  membership.sortOrder,
              description:
                  membership.description,
              upgradePrice:
                  membership.upgradePrice,
          }
        : null,

    createdAt: user.createdAt,
});