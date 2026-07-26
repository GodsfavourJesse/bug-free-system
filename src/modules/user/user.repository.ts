import { eq } from "drizzle-orm";
import { DbExecutor } from "../../database/types/types";
import { db } from "../../database";
import { users } from "../../database/schema";


export class UserRepository {

    // Find a user by ID.
    async findById(
        executor: DbExecutor = db,
        userId: string,
    ) {
        const [user] = await executor
            .select()
            .from(users)
            .where(
                eq(users.id, userId),
            )
            .limit(1);

        return user ?? null;
    }

    // Find a user by membership plan.
    async findByMembershipPlan(
        executor: DbExecutor = db,
        membershipPlanId: string,
    ) {
        return executor
            .select()
            .from(users)
            .where(
                eq(
                    users.membershipPlanId,
                    membershipPlanId,
                ),
            );
    }

    // Update a user's membership plan.
    async updateMembershipPlan(
        executor: DbExecutor = db,
        userId: string,
        membershipPlanId: string,
    ) {
        const [user] = await executor
            .update(users)
            .set({
                membershipPlanId,
                updatedAt: new Date(),
            })
            .where(
                eq(users.id, userId),
            )
            .returning();

        return user ?? null;
    }

    // Update whether a user can upgrade.
    async updateCanUpgrade(
        executor: DbExecutor = db,
        userId: string,
        canUpgrade: boolean,
    ) {
        const [user] = await executor
            .update(users)
            .set({
                canUpgrade,
                updatedAt: new Date(),
            })
            .where(
                eq(users.id, userId),
            )
            .returning();

        return user ?? null;
    }

    // Update both membership plan and upgrade permission.
    //
    // Used during membership approvals to keep the
    // update atomic within a transaction.
    async updateMembership(
        executor: DbExecutor = db,
        userId: string,
        membershipPlanId: string,
        canUpgrade: boolean,
    ) {
        const [user] = await executor
            .update(users)
            .set({
                membershipPlanId,
                canUpgrade,
                updatedAt: new Date(),
            })
            .where(
                eq(users.id, userId),
            )
            .returning();

        return user ?? null;
    }

    // Lock a user row.
    // Used during upgrade approval to prevent
    // concurrent membership updates.
    async lockById(
        executor: DbExecutor,
        userId: string,
    ) {
        const [user] = await executor
            .select()
            .from(users)
            .where(
                eq(users.id, userId),
            )
            .limit(1)
            .for("update");

        return user ?? null;
    }
}

export const userRepository =
    new UserRepository();