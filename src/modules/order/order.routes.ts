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

// Today's order items
router.get(
    "/today/items",
    orderController.getTodayOrderItems,
);

// Single task
router.get(
    "/items/:itemId",
    orderController.getOrderItem,
);

// Complete one task.
router.post(
    "/items/:itemId/complete",
    orderController.completeOrderItem,
);

// Optional ( Get one daily task group.)
router.get(
    "/:id",
    orderController.getOrder,
);

export default router;