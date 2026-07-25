import { walletService } from "@/modules/wallet/wallet.service";
import { referralService } from "@/modules/referral/referral.service";
import { transactionService } from "@/modules/transaction/transaction.service";

import {
    adminUserProfileRepository,
} from "./admin-user-profile.repository";

import {
    UserProfileDto,
} from "./admin-user-profile.dto";
import { UserNotFoundError } from "./admin-user-profile.errors";


export class AdminUserProfileService {

    // Return a complete user profile
    // for the admin dashboard.
    async getUserProfile(
        dto: UserProfileDto,
    ) {

        // Find the user.
        const user = await adminUserProfileRepository.findUserById(
            undefined,
            dto.userId,
        );

        if (!user) {
            throw new UserNotFoundError();
        }

        // Find the user's wallet.
        const wallet = await walletService.findByUserId(
            undefined,
            dto.userId,
        );

        // Find the user's transactions.
        const transactions = await transactionService.findByUser(
            dto.userId,
        );

        // Find the user's referrals.
        const [
            referrals,
            referralStats,
        ] = await Promise.all([
            referralService.getDirectReferrals(
                dto.userId,
            ),
            referralService.getReferralStats(
                dto.userId,
            ),
        ]);

        return {
            user,
            membership: user.membership,
            wallet,
            referrals,
            referralStats,
            transactions,
        };
    }

}

export const adminUserProfileService =
    new AdminUserProfileService();