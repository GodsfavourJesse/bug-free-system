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
import { validateAdminLogin, validateUserLogin } from "../../helpers/login.helper";
import { validateRefreshToken } from "../../helpers/refresh.helper";

export class AuthService {

    // Register a new user.
    // Every user receives a wallet before registration completes.
    async register(data: RegisterInput) {
        const {
            phone,
            password,
            referral,
        } = data;

        const existingUser =
            await authRepository.findUserByPhone(phone);

        if (existingUser) {
            throw new Error(
                "Phone number already exists."
            );
        }

        const internshipPlan = membershipPlanValidation.ensureMembershipPlanExists(
            await membershipPlanRepository.findInternship(db),
        );

        const referredBy = await resolveReferral(referral);

        const hashedPassword = await hashPassword(password);

        const referralCode = await generateReferralCode();

        const user = await withTransaction(
            async (tx) => {

                const createUser = await authRepository.createUser(
                    tx,
                    {
                        phone,
                        password: hashedPassword,
                        referralCode,
                        referredBy,
                        membershipPlanId: internshipPlan.id,
                    },
                );

                await walletRepository.create(
                    tx,
                    createUser.id,
                );

                return createUser;
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
            tokens.refreshTokenExpiresAt
        );

        return {
            user: toUserResponse(user),
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    // User Login
    async login(data: LoginInput) {
        const user = await validateUserLogin(
            data.phone,
            data.password
        );

        const tokens = tokenService.generateTokens({
            id: user.id,
            role: user.role,
        });

        await authRepository.saveRefreshToken(
            db,
            user.id,
            tokens.refreshToken,
            tokens.refreshTokenExpiresAt
        );

        return {
            user: toUserResponse(user),
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    // Admin Login
    async adminLogin(data: AdminLoginInput) {
        const admin = await validateAdminLogin(
            data.email,
            data.password
        );

        const tokens = tokenService.generateTokens({
            id: admin.id,
            role: admin.role,
        });

        await authRepository.saveRefreshToken(
            db,
            admin.id,
            tokens.refreshToken,
            tokens.refreshTokenExpiresAt
        );

        return {
            user: toUserResponse(admin),
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    // Refresh access and refresh tokens.
    async refresh(
        refreshToken: string
    ) {
        const user = await validateRefreshToken(
            refreshToken
        );

        const tokens = tokenService.generateTokens({
            id: user.id,
            role: user.role,
        });

        await withTransaction(
            async (tx) => {
                await authRepository.deleteRefreshToken(
                    tx,
                    refreshToken
                );

                await authRepository.saveRefreshToken(
                    tx,
                    user.id,
                    tokens.refreshToken,
                    tokens.refreshTokenExpiresAt
                );
            },
        );

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    // Logout
    async logout(refreshToken: string) {
        await authRepository.deleteRefreshToken(
            db,
            refreshToken
        );

        return {
            message: "Logged out successfully.",
        };
    }

    // Return the authentiated user's profile.
    async me(userId: string) {
        const user = await authRepository.findUserById(userId);

        if (!user) {
            throw new Error("User not found.");
        }

        return toUserResponse(user);
    }

    // Find a user by ID.
    async findUserById(id: string) {
        return authRepository.findUserById(id);
    }

    // Find a user by phone number.
    async findUserByPhone(phone: string) {
        return authRepository.findUserByPhone(phone);
    }

    // Find a user by referral code.
    async findUserByReferralCode(referralCode: string) {
        return authRepository.findUserByReferralCode(
            referralCode
        );
    }
}

export const authService = new AuthService();