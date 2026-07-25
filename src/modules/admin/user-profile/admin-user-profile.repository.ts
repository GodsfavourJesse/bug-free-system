import { db } from "@/database";
import { eq } from "drizzle-orm";

import { DbExecutor } from "@/database/types/types";

import {
    users,
    membershipPlans,
} from "@/database/schema";

export class AdminUserProfileRepository {

    // Find one user by ID.
    async findUserById(
        executor: DbExecutor = db,
        userId: string,
    ) {
        const [user] = await executor
            .select({
                id: users.id,

                phone: users.phone,
                email: users.email,

                role: users.role,

                isVerified:
                    users.isVerified,

                isActive:
                    users.isActive,

                canUpgrade:
                    users.canUpgrade,

                referralCode:
                    users.referralCode,

                referredBy:
                    users.referredBy,

                membershipPlanId:
                    users.membershipPlanId,

                createdAt:
                    users.createdAt,

                updatedAt:
                    users.updatedAt,

                membership: {
                    id:
                        membershipPlans.id,

                    name:
                        membershipPlans.name,

                    slug:
                        membershipPlans.slug,

                    upgradePrice:
                        membershipPlans.upgradePrice,

                    isInternship:
                        membershipPlans.isInternship,
                },
            })
            .from(users)
            .leftJoin(
                membershipPlans,
                eq(
                    users.membershipPlanId,
                    membershipPlans.id,
                ),
            )
            .where(
                eq(
                    users.id,
                    userId,
                ),
            )
            .limit(1);

        return user ?? null;
    }

}

export const adminUserProfileRepository =
    new AdminUserProfileRepository();