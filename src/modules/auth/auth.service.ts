import { authRepository } from "./auth.repository";
import { tokenService } from "../token/token.service";
import { AdminLoginInput, LoginInput, RegisterInput } from "../../validators/validator";
import { toUserResponse } from "../../utils/mappers/user.mapper";
import { walletRepository } from "../wallet/wallet.repository";
import { membershipPlanValidation } from "../membership-plan/membershipPlan.validation";
import { membershipPlanRepository } from "../membership-plan/membershipPlan.repository";
import { db } from "../../database";
import { resolveReferral } from "../../helpers/register.helper";
import { hashPassword } from "../../utils/hash";
import { generateReferralCode } from "../../helpers/referral.helper";
import { withTransaction } from "../../database/transaction/transaction";
import { validateAdminLogin, validateUserLogin} from "../../helpers/login.helper";
import { validateRefreshToken } from "../../helpers/refresh.helper";
import { notificationService } from "../notification/notification.service";
import { NotificationType } from "../../database/enums/notification.enum";

export class AuthService {

    // Register a new user.
    // New users start on the internship membership and receive a wallet.
    async register(data: RegisterInput) {
        const {
            phone,
            password,
            referral,
            country,
        } = data;

        const existingUser = await authRepository.findUserByPhone(
            phone,
        );

        if (existingUser) {
            throw new Error(
                "Phone number already exists.",
            );
        }

        const internshipPlan = membershipPlanValidation.ensureMembershipPlanExists(
            await membershipPlanRepository.findInternship(
                db,
            ),
        );

        const referredBy = referral
            ? await resolveReferral(referral)
            : null;

        const hashedPassword = await hashPassword(password);

        const referralCode = await generateReferralCode();

        const user = await withTransaction(
            async (tx) => {
                const createdUser =
                    await authRepository.createUser(
                        tx,
                        {
                            phone,
                            password: hashedPassword,
                            referralCode,
                            referredBy,
                            membershipPlanId:
                                internshipPlan.id,
                            country:
                                country || "Nigeria",
                        },
                    );

                await walletRepository.create(
                    tx,
                    createdUser.id,
                );

                await notificationService.notifyUser(
                    tx,
                    {
                        userId: createdUser.id,
                        title: "Welcome",

                        message:
                            "Welcome to our platform. Your account has been created successfully.",

                        type: NotificationType.SYSTEM,

                        metadata: {
                            event: "user_registered",
                            membershipPlanId: internshipPlan.id,
                        },
                    },
                );

                await notificationService.notifyAdmins(
                    tx,
                    {
                        title: "New User Registered",

                        message:
                            `A new user (${createdUser.phone}) has registered successfully.`,

                        type: NotificationType.SYSTEM,

                        metadata: {
                            userId: createdUser.id,
                            phone: createdUser.phone,
                            referralCode: createdUser.referralCode,
                            referredBy: createdUser.referredBy,
                        },
                    },
                );

                return createdUser;
            },
        );

        const tokens = tokenService.generateTokens({
            id: user.id,
            role: user.role,
        });

        await authRepository.saveRefreshToken(
            db,
            user.id,
            tokens.refreshToken,
            tokens.refreshTokenExpiresAt,
        );

        return {
            user: toUserResponse({
                user,
                membership: internshipPlan,
            }),

            accessToken: tokens.accessToken,

            refreshToken: tokens.refreshToken,
        };
    }

    // User login.
    async login(data: LoginInput) {
        const user = await validateUserLogin(
            data.phone,
            data.password,
        );

        const membership =
            user.membershipPlanId
                ? await membershipPlanRepository.findById(
                    db,
                    user.membershipPlanId,
                )
                : null;

        const tokens = tokenService.generateTokens({
            id: user.id,
            role: user.role,
        });

        await authRepository.saveRefreshToken(
            db,
            user.id,
            tokens.refreshToken,
            tokens.refreshTokenExpiresAt,
        );

        return {
            user: toUserResponse({
                user,
                membership,
            }),

            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    // Admin login.
    async adminLogin(
        data: AdminLoginInput,
    ) {
        const admin = await validateAdminLogin(
            data.email,
            data.password,
        );

        const tokens = tokenService.generateTokens({
            id: admin.id,
            role: admin.role,
        });

        await authRepository.saveRefreshToken(
            db,
            admin.id,
            tokens.refreshToken,
            tokens.refreshTokenExpiresAt,
        );

        return {
            user: toUserResponse({
                user: admin,
                membership: null,
            }),

            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    // Refresh authentication tokens.
    async refresh(
        refreshToken: string,
    ) {
        const user = await validateRefreshToken(
            refreshToken,
        );

        const tokens = tokenService.generateTokens({
            id: user.id,
            role: user.role,
        });

        await withTransaction(
            async (tx) => {
                await authRepository.deleteRefreshToken(
                    tx,
                    refreshToken,
                );

                await authRepository.saveRefreshToken(
                    tx,
                    user.id,
                    tokens.refreshToken,
                    tokens.refreshTokenExpiresAt,
                );
            },
        );

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    // Logout.
    async logout(
        refreshToken: string,
    ) {
        await authRepository.deleteRefreshToken(
            db,
            refreshToken,
        );

        return {
            message: "Logged out successfully.",
        };
    }

    // Get the authenticated user.
    async me(userId: string) {
        const result = await authRepository.findUserById(
            userId,
        );

        if (!result) {
            throw new Error("User not found.");
        }

        return toUserResponse(result);
    }

    // Update the authenticated user's profile.
    async updateMe(
        userId: string,
        data: {
            email?: string | null;
        },
    ) {
        const result =
            await authRepository.findUserById(
                userId,
            );

        if (!result) {
            throw new Error("User not found.");
        }

        const currentUser =
            result.user;

        let email:
            | string
            | null
            | undefined;

        if (data.email !== undefined) {
            email =
                data.email
                    ?.trim()
                    .toLowerCase() || null;

            if (email) {
                const existingUser =
                    await authRepository.findUserByEmail(
                        email,
                    );

                if (
                    existingUser &&
                    existingUser.id !== userId
                ) {
                    throw new Error(
                        "Email address is already in use.",
                    );
                }
            }
        }

        const updatedUser =
            await db.transaction(
                async (tx) => {

                    const user =
                        await authRepository
                            .updateUserEmail(
                                tx,
                                userId,
                                email ??
                                    currentUser.email ??
                                    null,
                            );

                    if (!user) {
                        throw new Error(
                            "Unable to update profile.",
                        );
                    }

                    await notificationService
                        .notifyUser(
                            tx,
                            {
                                userId,

                                title:
                                    "Profile Updated",

                                message:
                                    "Your email address has been updated successfully.",

                                type:
                                    NotificationType.SECURITY,

                                metadata: {
                                    event:
                                        "email_updated",
                                },
                            },
                        );

                    return user;
                },
            );

        const updatedProfile =
            await authRepository.findUserById(
                userId,
            );

        if (!updatedProfile) {
            throw new Error(
                "Unable to load updated profile.",
            );
        }

        return toUserResponse(
            updatedProfile,
        );
    }

    async findUserById(id: string) {
        return authRepository.findUserById(
            id,
        );
    }

    async findUserByPhone(
        phone: string,
    ) {
        return authRepository.findUserByPhone(
            phone,
        );
    }

    async findUserByReferralCode(
        referralCode: string,
    ) {
        return authRepository.findUserByReferralCode(
            referralCode,
        );
    }
}

export const authService = new AuthService();