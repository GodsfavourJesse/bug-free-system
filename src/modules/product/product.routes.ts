import { Router } from "express";
import { productController } from "./product.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

/**
 * Get available products.
 *
 * GET /products
 */
router.get(
    "/",
    authenticate,
    productController.getProducts,
);

router.get(
    "/dashboard",
    authenticate,
    productController.getDashboard,
);

/**
 * Get a single product.
 *
 * GET /products/:id
 */
router.get(
    "/:id",
    authenticate,
    productController.getProduct,
);

/**
 * Complete a product.
 *
 * POST /products/:id/complete
 */
router.post(
    "/:id/complete",
    authenticate,
    productController.completeProduct,
);

export default router;