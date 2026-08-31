import { eq, sql } from "drizzle-orm";
import { DbExecutor } from "../../database/types/types";
import { db } from "../../database";
import { users } from "../../database/schema";

export class ReferralRepository {

    private publicUserSelection = {
        id: users.id,
        phone: users.phone,
        email: users.email,
        referralCode: users.referralCode,
        membershipPlanId: users.membershipPlanId,
        isActive: users.isActive,
        createdAt: users.createdAt,
    };

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
                .select({
                    referredBy: users.referredBy,
                })
                .from(users)
                .where(
                    eq(users.id, currentUserId),
                )
                .limit(1);

            if ( !user?.referredBy ) {
                break;
            }

            const [parent] = await executor
                .select(this.publicUserSelection)
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
            .select(this.publicUserSelection)
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

    // Return referral statistics using one recursive
    // PostgreSQL query instead of repeatedly querying the database for every level and descendant.
    async getReferralStats(
        executor: DbExecutor = db,
        userId: string,
    ) {
        const result = await executor.execute(
            sql`
                WITH RECURSIVE referral_tree AS (

                    // Level 1:
                    // Users directly referred by the authenticated user.
                    SELECT
                        u.id AS user_id,
                        1 AS level,
                        ARRAY[u.id]::uuid[] AS path
                    FROM users u
                    WHERE u.referred_by = ${userId}

                    UNION ALL

                    // Find the children of every referral.
                    // We continue beyond level 3 because totalTeam represents the complete referral network.
                    SELECT
                        child.id AS user_id,
                        referral_tree.level + 1 AS level,
                        referral_tree.path || child.id
                    FROM users child
                    INNER JOIN referral_tree
                        ON child.referred_by =
                           referral_tree.user_id

                    // Prevent a malformed referral cycle from causing infinite recursion.
                    WHERE NOT (
                        child.id = ANY(referral_tree.path)
                    )
                )

                SELECT
                    COUNT(*) FILTER (
                        WHERE level = 1
                    ) AS level_1,

                    COUNT(*) FILTER (
                        WHERE level = 2
                    ) AS level_2,

                    COUNT(*) FILTER (
                        WHERE level = 3
                    ) AS level_3,

                    COUNT(*) AS total_team

                FROM referral_tree;
            `,
        );

        const row = result.rows[0] as {
            level_1: string | number;
            level_2: string | number;
            level_3: string | number;
            total_team: string | number;
        };

        return {
            directReferrals: Number(row.level_1),
            level1: Number(row.level_1),
            level2: Number(row.level_2),
            level3: Number(row.level_3),
            totalTeam: Number(row.total_team),
        };
    }
}

export const referralRepository = new ReferralRepository();