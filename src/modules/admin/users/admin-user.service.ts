import { db } from "@/database";
import { withTransaction } from "@/database/transaction/transaction";
import { DbExecutor } from "@/database/types/types";

import {
    NotificationType,
} from "@/database/enums/notification.enum";

import {
    PaginationDto,
    SearchUsersDto,
    FilterUsersDto,
    SuspendUserDto,
    ActivateUserDto,
    VerifyUserDto,
} from "./admin-user.dto";

import {
    adminUserRepository,
} from "./admin-user.repository";

import {
    adminUserValidation,
} from "./admin-user.validation";

import {
    notificationService,
} from "@/modules/notification/notification.service";
import { UserProfileDto } from "../user-profile/admin-user-profile.dto";
import { UserNotFoundError } from "../user-profile/admin-user-profile.errors";
import { walletService } from "@/modules/wallet/wallet.service";
import { transactionService } from "@/modules/transaction/transaction.service";
import { referralService } from "@/modules/referral/referral.service";

export class AdminUserService {

    // Return all users.
    async getUsers(
        dto: PaginationDto,
        executor: DbExecutor = db,
    ) {
        return adminUserRepository.findAll(
            executor,
            dto,
        );
    }

    // Search users.
    async searchUsers(
        dto: SearchUsersDto,
        executor: DbExecutor = db,
    ) {
        return adminUserRepository.search(
            executor,
            dto,
        );
    }

    // Filter users.
    async filterUsers(
        dto: FilterUsersDto,
        executor: DbExecutor = db,
    ) {
        return adminUserRepository.filter(
            executor,
            dto,
        );
    }

    // Suspend a user account.
    async suspendUser(
        dto: SuspendUserDto,
    ) {
        return withTransaction(
            async (tx) => {

                const user =
                    await adminUserRepository.findById(
                        tx,
                        dto.userId,
                    );

                adminUserValidation.ensureUserExists(
                    user,
                );

                adminUserValidation.ensureActive(
                    user,
                );

                const updated =
                    await adminUserRepository.suspend(
                        tx,
                        dto.userId,
                    );

                await this.notifyUser(
                    tx,
                    dto.userId,
                    "Account Suspended",
                    "Your account has been suspended. Please contact support for assistance.",
                );

                return updated;

            },
        );
    }

    // Activate a user account.
    async activateUser(
        dto: ActivateUserDto,
    ) {
        return withTransaction(
            async (tx) => {

                const user =
                    await adminUserRepository.findById(
                        tx,
                        dto.userId,
                    );

                adminUserValidation.ensureUserExists(
                    user,
                );

                adminUserValidation.ensureInactive(
                    user,
                );

                const updated =
                    await adminUserRepository.activate(
                        tx,
                        dto.userId,
                    );

                await this.notifyUser(
                    tx,
                    dto.userId,
                    "Account Activated",
                    "Your account has been reactivated. You can continue using the platform.",
                );

                return updated;

            },
        );
    }

    // Verify a user account.
    async verifyUser(
        dto: VerifyUserDto,
    ) {
        return withTransaction(
            async (tx) => {

                const user =
                    await adminUserRepository.findById(
                        tx,
                        dto.userId,
                    );

                adminUserValidation.ensureUserExists(
                    user,
                );

                adminUserValidation.ensureNotVerified(
                    user,
                );

                const updated =
                    await adminUserRepository.verify(
                        tx,
                        dto.userId,
                    );

                await this.notifyUser(
                    tx,
                    dto.userId,
                    "Account Verified",
                    "Congratulations! Your account has been verified successfully.",
                );

                return updated;

            },
        );
    }

    // Notify a user about an account action.
    protected async notifyUser(
        executor: DbExecutor = db,
        userId: string,
        title: string,
        message: string,
    ) {
        await notificationService.notifyUser(
            executor,
            {
                userId,
                title,
                message,
                type: NotificationType.SYSTEM,
            },
        );
    }

    // Return a complete user profile.
    async getUserProfile(
        dto: UserProfileDto,
        executor: DbExecutor = db,
    ) {

        const user = await adminUserRepository.findById(
            executor,
            dto.userId,
        );

        if (!user) {
            throw new UserNotFoundError();
        }

        const wallet = await walletService.findByUserId(
            executor,
            dto.userId,
        );

        const transactions = await transactionService.findByUser(
            dto.userId,
        );

        const referrals = await referralService.getDirectReferrals(
            dto.userId,
        );

        return {
            user,
            wallet,
            referrals,
            transactions,
        };
    }

}

export const adminUserService =
    new AdminUserService();