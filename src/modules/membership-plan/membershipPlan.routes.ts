import { Router } from "express";

import { membershipPlanController } from "./membershipPlan.controller";

import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// PUBLIC

// Membership catalog
router.get(
    "/",
    membershipPlanController.getMembershipCatalog,
);

// AUTHENTICATED USER

// Current membership
router.get(
    "/current",
    authenticate,
    membershipPlanController.getCurrentPlan,
);

// Next available membership
router.get(
    "/next",
    authenticate,
    membershipPlanController.getNextPlan,
);

// INTERNAL / ID

// Membership by UUID
router.get(
    "/id/:id",
    membershipPlanController.getPlan,
);

// PUBLIC / SLUG

// Membership by slug
//
// Example:
// /api/v1/membership-plans/1-star
router.get(
    "/:slug",
    membershipPlanController.getPlanBySlug,
);

export default router;