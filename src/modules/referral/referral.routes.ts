import { Router } from "express";

import { authenticate } from "@/middlewares/auth.middleware";

import { referralController } from "./referral.controller";

const router = Router();

// Every referral endpoint requires authentication.
router.use(authenticate);

// Get all referral information.
router.get(
    "/",
    referralController.getReferrals.bind(
        referralController,
    ),
);

// Get direct referrals.
router.get(
    "/direct",
    referralController.getDirectReferrals.bind(
        referralController,
    ),
);

// Get the complete referral tree.
router.get(
    "/tree",
    referralController.getReferralTree.bind(
        referralController,
    ),
);

// Get referral statistics.
router.get(
    "/stats",
    referralController.getReferralStats.bind(
        referralController,
    ),
);

// Get the authenticated user's referral link.
router.get(
    "/link",
    referralController.getReferralLink.bind(
        referralController,
    ),
);

export default router;