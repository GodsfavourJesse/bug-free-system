import { Router } from "express";

import {
    authenticate,
} from "@/middlewares/auth.middleware";

import {
    authorize,
} from "@/middlewares/role.middleware";

import {
    USER_ROLES,
} from "@/constants/roles";

import {
    adminUserProfileController,
} from "./admin-user-profile.controller";

const router = Router();

// Protect every route.
router.use(
    authenticate,
);

router.use(
    authorize(
        USER_ROLES.ADMIN,
    ),
);

// View one user profile.
router.get(
    "/:id",
    adminUserProfileController.getUserProfile.bind(
        adminUserProfileController,
    ),
);

export default router;