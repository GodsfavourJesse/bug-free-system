import { eq } from "drizzle-orm";
import { DbExecutor } from "../../database/types/types";
import { db } from "../../database";
import { users } from "../../database/schema";

export class ReferralRepository {

    // Return the referral chain above a user.
    // Ordered from Level 1 upwards.
    async findAncestors(
        executor: DbExecutor = db,
        userId: string,
        maxLevel = 3,
    ) {
        const ancestors = [];

        let currentUserId = userId;

        for (
            let level = 1;
            level <= maxLevel;
            level++
        ) {

            const [user] = await executor
                .select()
                .from(users)
                .where(
                    eq(users.id, currentUserId),
                )
                .limit(1);

            if (
                !user?.referredBy
            ) {
                break;
            }

            const [parent] = await executor
                .select()
                .from(users)
                .where(
                    eq(
                        users.id,
                        user.referredBy,
                    ),
                )
                .limit(1);

            if (!parent) {
                break;
            }

            ancestors.push({
                level,
                user: parent,
            });

            currentUserId = parent.id;
        }
        
        return ancestors;
    }

    // Find every direct referral of a user.
    async findDirectReferrals(
        executor: DbExecutor,
        userId: string,
    ) {
        return executor
            .select()
            .from(users)
            .where(
                eq(
                    users.referredBy,
                    userId,
                ),
            );
    }

    // Count direct referrals.
    async countDirectReferrals(
        executor: DbExecutor,
        userId: string,
    ) {
        const referrals =
            await this.findDirectReferrals(
                executor,
                userId,
            );

        return referrals.length;
    }

    // Find the sponsor (parent) of a user.
    async findParent(
        executor: DbExecutor,
        userId: string,
    ) {
        const [user] =
            await executor
                .select({
                    referredBy:
                        users.referredBy,
                })
                .from(users)
                .where(
                    eq(
                        users.id,
                        userId,
                    ),
                )
                .limit(1);

        if (
            !user?.referredBy
        ) {
            return null;
        }

        const [parent] =
            await executor
                .select()
                .from(users)
                .where(
                    eq(
                        users.id,
                        user.referredBy,
                    ),
                )
                .limit(1);

        return parent ?? null;
    }

    // Find users referred by any parent.
    async findChildren(
        executor: DbExecutor,
        parentId: string,
    ) {
        return this.findDirectReferrals(
            executor,
            parentId,
        );
    }
}

export const referralRepository =
    new ReferralRepository();