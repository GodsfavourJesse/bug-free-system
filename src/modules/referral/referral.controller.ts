import { Request, Response } from "express";

import { referralService } from "./referral.service";

export class ReferralController {

    // Return every direct referral.
    async getDirectReferrals(
        req: Request,
        res: Response,
    ) {

        const referrals =
            await referralService.getDirectReferrals(
                req.user!.id,
            );

        return res.json({
            success: true,
            data: referrals,
        });
    }

    // Return the complete referral tree.
    async getReferralTree(
        req: Request,
        res: Response,
    ) {

        const tree =
            await referralService.getReferralTree(
                req.user!.id,
            );

        return res.json({
            success: true,
            data: tree,
        });
    }

    // Return referral statistics.
    async getReferralStats(
        req: Request,
        res: Response,
    ) {

        const stats =
            await referralService.getReferralStats(
                req.user!.id,
            );

        return res.json({
            success: true,
            data: stats,
        });
    }

    // Return the authenticated user's referral link.
    async getReferralLink(
        req: Request,
        res: Response,
    ) {

        const link =
            await referralService.getReferralLink(
                req.user!.id,
            );

        return res.json({
            success: true,
            data: link,
        });
    }

    // Return every referral grouped by level.
    async getReferrals(
        req: Request,
        res: Response,
    ) {

        const [
            direct,
            level1,
            level2,
            level3,
        ] = await Promise.all([

            referralService.getDirectReferrals(
                req.user!.id,
            ),

            referralService.getLevel1(
                req.user!.id,
            ),

            referralService.getLevel2(
                req.user!.id,
            ),

            referralService.getLevel3(
                req.user!.id,
            ),
        ]);

        return res.json({
            success: true,
            data: {
                direct,
                level1,
                level2,
                level3,
            },
        });
    }
}

export const referralController =
    new ReferralController();