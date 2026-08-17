import { Router } from "express";
import { authController } from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

/**
 * ===========================
 * Authentication
 * ===========================
 */

// User Registration
router.post(
    "/register",
    authController.register
);

// User Login (Phone)
router.post(
    "/login",
    authController.login
);

// Admin Login (Email)
router.post(
    "/admin/login",
    authController.adminLogin
);

// Refresh Access Token
router.post(
    "/refresh",
    authController.refresh
);

// Logout
router.post(
    "/logout",
    authController.logout
);

/**
 * ===========================
 * Current Authenticated User
 * ===========================
 */

router.get(
    "/me",
    authenticate,
    authController.me
);

router.patch(
    "/me",
    authenticate,
    authController.updateMe
);

export default router;