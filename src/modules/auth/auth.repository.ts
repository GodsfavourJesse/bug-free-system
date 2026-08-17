import { eq } from "drizzle-orm";
import { db } from "../../database";
import {
    membershipPlans,
    refreshTokens,
    users,
} from "../../database/schema";
import { DbExecutor } from "../../database/types/types";

export class AuthRepository {

    // ===========================
    // Users
    // ===========================

    // Find a user by ID.
    async findUserById(
        id: string,
        executor: DbExecutor = db,
    ) {
        const result = await executor
            .select({
                user: users,
                membership: membershipPlans,
            })
            .from(users)
            .leftJoin(
                membershipPlans,
                eq(
                    users.membershipPlanId,
                    membershipPlans.id,
                ),
            )
            .where(eq(users.id, id))
            .limit(1);

        return result[0] ?? null;
    }

    // Find a user by phone number.
    async findUserByPhone(
        phone: string,
        executor: DbExecutor = db,
    ) {
        const result = await executor
            .select()
            .from(users)
            .where(eq(users.phone, phone))
            .limit(1);

        return result[0] ?? null;
    }

    // Find a user by email.
    async findUserByEmail(
        email: string,
        executor: DbExecutor = db,
    ) {
        const result = await executor
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        return result[0] ?? null;
    }

    // Update a user's email address.
    async updateUserEmail(
        executor: DbExecutor = db,
        userId: string,
        email: string | null,
    ) {
        const [user] = await executor
            .update(users)
            .set({
                email,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
            .returning();

        return user ?? null;
    }

    // Find a user by referral code.
    async findUserByReferralCode(
        referralCode: string,
        executor: DbExecutor = db,
    ) {
        const result = await executor
            .select()
            .from(users)
            .where(
                eq(
                    users.referralCode,
                    referralCode,
                ),
            )
            .limit(1);

        return result[0] ?? null;
    }

    // Create a new user.
    async createUser(
        executor: DbExecutor,
        data: {
            phone: string;
            password: string;
            referralCode: string;
            referredBy: string | null;
            membershipPlanId: string;
            country: string;
            email?: string;
            role?: "admin" | "user";
        }
    ) {
        const [user] = await executor
            .insert(users)
            .values({
                phone: data.phone,
                password: data.password,
                country: data.country,
                email: data.email ?? null,
                referralCode: data.referralCode,
                referredBy: data.referredBy,
                membershipPlanId: data.membershipPlanId,
                role: data.role ?? "user",
            })
            .returning();

        return user;
    }

    // Update a user's password.
    async updatePassword(
        executor: DbExecutor,
        userId: string,
        password: string
    ) {
        const [user] = await executor
            .update(users)
            .set({
                password,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
            .returning();

        return user;
    }

    // Mark a user as verified.
    async verifyUser(
        executor: DbExecutor,
        userId: string
    ) {
        const [user] = await executor
            .update(users)
            .set({
                isVerified: true,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
            .returning();

        return user;
    }

    // Activat a user account.
    async activateUser(
        executor: DbExecutor,
        userId: string
    ) {
        const [user] = await executor
            .update(users)
            .set({
                isActive: true,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
            .returning();

        return user;
    }

    async deactivateUser(
        executor: DbExecutor,
        userId: string
    ) {
        const [user] = await executor
            .update(users)
            .set({
                isActive: false,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
            .returning();

        return user;
    }

    async phoneExists(phone: string) {
        return !!(await this.findUserByPhone(phone));
    }

    async referralCodeExists(
        referralCode: string
    ) {
        return !!(
            await this.findUserByReferralCode(
                referralCode
            )
        );
    }

    async countUsers() {
        const result = await db
            .select()
            .from(users);

        return result.length;
    }

    // ===========================
    // Refresh Tokens
    // ===========================

    // Save a refresh token.
    async saveRefreshToken(
        executor: DbExecutor,
        userId: string,
        token: string,
        expiresAt: Date
    ) {
        const [refreshToken] = await executor
            .insert(refreshTokens)
            .values({
                userId,
                token,
                expiresAt,
            })
            .returning();

        return refreshToken;
    }

    async findRefreshToken(
        token: string
    ) {
        const result = await db
            .select()
            .from(refreshTokens)
            .where(
                eq(
                    refreshTokens.token,
                    token
                )
            )
            .limit(1);

        return result[0] ?? null;
    }

    // Delete a refresh token.
    async deleteRefreshToken(
        executor: DbExecutor,
        token: string
    ) {
        await executor
            .delete(refreshTokens)
            .where(
                eq(
                    refreshTokens.token,
                    token
                )
            );
    }

    // Delete all refresh token belonging to a user.
    async deleteUserRefreshTokens(
        executor: DbExecutor,
        userId: string
    ) {
        await executor
            .delete(refreshTokens)
            .where(
                eq(
                    refreshTokens.userId,
                    userId
                )
            );
    }
}

export const authRepository =
    new AuthRepository();