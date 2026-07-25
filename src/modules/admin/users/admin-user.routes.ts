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
import { adminUserController } from "./admin-user-controller";


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

// List users.
router.get(
    "/",
    adminUserController.getUsers.bind(
        adminUserController,
    ),
);

// Search users.
router.get(
    "/search",
    adminUserController.searchUsers.bind(
        adminUserController,
    ),
);

// Filter users.
router.get(
    "/filter",
    adminUserController.filterUsers.bind(
        adminUserController,
    ),
);

// View one user profile.
router.get(
    "/:id",
    adminUserController.getUserProfile.bind(
        adminUserController,
    ),
);

// Suspend a user.
router.patch(
    "/:id/suspend",
    adminUserController.suspendUser.bind(
        adminUserController,
    ),
);

// Activate a user.
router.patch(
    "/:id/activate",
    adminUserController.activateUser.bind(
        adminUserController,
    ),
);

// Verify a user.
router.patch(
    "/:id/verify",
    adminUserController.verifyUser.bind(
        adminUserController,
    ),
);

export default router;