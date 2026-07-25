import { Router } from "express";

import { membershipPlanController } from "./membershipPlan.controller";
import { authenticate } from "@/middlewares/auth.middleware";

const router = Router();

// Returns every membership plan.
router.get(
    "/",
    membershipPlanController.getPlans,
);

// Returns a membership plan by slug.
router.get(
    "/slug/:slug",
    membershipPlanController.getPlanBySlug,
);

// Returns the authenticated user's current membership plan.
router.get(
    "/current",
    authenticate,
    membershipPlanController.getCurrentPlan,
);

// Returns the authenticated user's next available membership plan.
router.get(
    "/next",
    authenticate,
    membershipPlanController.getNextPlan,
);

// Returns a membership plan by ID.
router.get(
    "/:id",
    membershipPlanController.getPlan,
);

export default router;