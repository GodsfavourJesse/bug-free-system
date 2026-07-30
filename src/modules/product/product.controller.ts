import {
    Request,
    Response,
    NextFunction,
} from "express";

import { productService } from "./product.service";


export class ProductController {

    getDashboard = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {

        try {

            const dashboard =
                await productService.getDashboard(
                    req.user!.id,
                );

            res.status(200).json({
                success: true,
                message:
                    "Product dashboard retrieved successfully.",
                data: dashboard,
            });

        } catch (error) {
            next(error);
        }

    };

    /**
     * Get products available
     * to the authenticated user.
     *
     * GET /products
     */
    getProducts = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {

            const products =
                await productService.getProducts(
                    req.user!.id,
                );

            res.status(200).json({
                success: true,
                message:
                    "Products retrieved successfully.",
                data: products,
            });

        } catch (error) {
            next(error);
        }
    };

    /**
     * Get a single product.
     *
     * GET /products/:id
     */
    getProduct = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {

            const productId =
                req.params.id as string;

            const product =
                await productService.getProduct(
                    productId,
                );

            res.status(200).json({
                success: true,
                message:
                    "Product retrieved successfully.",
                data: product,
            });

        } catch (error) {
            next(error);
        }
    };

    /**
     * Complete a product.
     *
     * POST /products/:id/complete
     */
    completeProduct = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {

            const productId =
                req.params.id as string;

            const completion =
                await productService.completeProduct(
                    req.user!.id,
                    productId,
                );

            res.status(201).json({
                success: true,
                message:
                    "Product completed successfully.",
                data: completion,
            });

        } catch (error) {
            next(error);
        }
    };

}

export const productController =
    new ProductController();