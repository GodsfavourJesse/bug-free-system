import { referralRepository } from "./referral.repository";
import { referralValidation } from "./referral.validation";
import { userRepository } from "../user/user.repository";
import { ReferralTreeNode } from "./referral.dto";
import { db } from "../../database";
import { env } from "../../config";

export class ReferralService {

    // Return Level 1, Level 2 and Level 3 uplines.
    async getAncestors(
        userId: string,
    ) {
        return referralRepository.findAncestors(
            db,
            userId,
        );
    }

    // Return every direct referral.
    async getDirectReferrals(
        userId: string,
    ) {
        return referralRepository.findDirectReferrals(
            db,
            userId,
        );
    }

    // Return the direct referral count.
    async countDirect(
        userId: string,
    ) {
        return referralRepository.countDirectReferrals(
            db,
            userId,
        );
    }

    // Return one referral level.
    private async getLevel(
        userId: string,
        level: number,
    ): Promise<any[]> {

        if (level <= 0) {
            return [];
        }

        const direct =
            await referralRepository.findDirectReferrals(
                db,
                userId,
            );

        if (level === 1) {
            return direct;
        }

        const result: any[] = [];

        for (const child of direct) {

            const children =
                await this.getLevel(
                    child.id,
                    level - 1,
                );

            result.push(
                ...children,
            );
        }

        return result;
    }

    // Level 1 referrals.
    async getLevel1(
        userId: string,
    ) {
        return this.getLevel(
            userId,
            1,
        );
    }

    // Level 2 referrals.
    async getLevel2(
        userId: string,
    ) {
        return this.getLevel(
            userId,
            2,
        );
    }

    // Level 3 referrals.
    async getLevel3(
        userId: string,
    ) {
        return this.getLevel(
            userId,
            3,
        );
    }

    // Count every referral in the tree.
    async countTeam(
        userId: string,
    ): Promise<number> {

        const direct =
            await referralRepository.findDirectReferrals(
                db,
                userId,
            );

        let total =
            direct.length;

        for (const child of direct) {

            total +=
                await this.countTeam(
                    child.id,
                );
        }

        return total;
    }

    // Build the complete referral tree.
    async getReferralTree(
        userId: string,
    ): Promise<ReferralTreeNode[]> {

        const children =
            await referralRepository.findDirectReferrals(
                db,
                userId,
            );

        const tree = [];

        for (const child of children) {

            tree.push({
                user: child,
                children:
                    await this.getReferralTree(
                        child.id,
                    ),
            });
        }

        return tree;
    }

    // Return referral statistics.
    // The repository performs the complete calculation using one PostgreSQL recursive CTE.
    async getReferralStats(
        userId: string,
    ) {
        return referralRepository.getReferralStats(
            db,
            userId,
        );
    }

    // Generate the authenticated user's referral link.
    async getReferralLink(
        userId: string,
    ) {

        const user = await userRepository.findById(
            db,
            userId,
        );

        referralValidation.ensureReferrerExists(
            user,
        );

        return {
            referralCode: user.referralCode,

            referralLink:
                `${env.client.referralBaseUrl}/register?ref=${user.referralCode}`,
        };
    }
}

export const referralService = new ReferralService();