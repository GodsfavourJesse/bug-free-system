import { Router } from "express";

import {
    corporateController,
} from "./corporate.controller";

import {
    authenticate,
} from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

// USER CORPORATE ANNOUNCEMENTS

/**
 * Get published corporate announcements
 * with the authenticated user's read status.
 *
 * GET /corporate
 */
router.get(
    "/",
    corporateController
        .getUserAnnouncements
        .bind(corporateController),
);

/**
 * Mark a corporate announcement as read.
 *
 * PATCH /corporate/:id/read
 */
router.patch(
    "/:id/read",
    corporateController
        .markAsRead
        .bind(corporateController),
);

export default router;