import { Router } from "express";
import { orderController } from "./order.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// Every endpoint requires authentication.
router.use(authenticate);

// Get today's daily task group.
router.get(
    "/today",
    orderController.getTodayOrder,
);

// Get one daily task group.
router.get(
    "/:id",
    orderController.getOrder,
);

// Get every task in a daily task group.
router.get(
    "/:id/items",
    orderController.getOrderItems,
);

// Complete one task.
router.post(
    "/items/:itemId/complete",
    orderController.completeOrderItem,
);

export default router;