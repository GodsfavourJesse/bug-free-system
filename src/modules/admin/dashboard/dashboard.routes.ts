import { Router } from "express";

import { dashboardController } from "./dashboard.controller";
import { authenticate } from "../../../middlewares/auth.middleware";
import { authorize } from "../../../middlewares/role.middleware";
import { USER_ROLES } from "../../../constants/roles";

const router = Router();

router.get(
    "/",
    authenticate,
    authorize(USER_ROLES.ADMIN),
    dashboardController.getDashboard,
);

export default router;