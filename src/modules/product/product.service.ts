import { productRepository } from "./product.repository";
import { productValidation } from "./product.validation";

import { rewardEngineService } from "../reward-engine/rewardEngine.service";

export class ProductService {

    async getDashboard(
        userId: string,
    ) {
        return productRepository.getDashboard(
            userId,
        );

    }

    /**
     * Get products available
     * to the authenticated user.
     *
     * Currently returns every active
     * advertisement.
     *
     * Later this will filter by:
     *
     * - Membership
     * - Daily Order Config
     */
    async getProducts(
        userId: string,
    ) {

        return productRepository.findAvailableProducts(
            undefined,
            userId,
        );
    }

    /**
     * Get a single product.
     *
     * Also increments its view count.
     */
    async getProduct(
        productId: string,
    ) {

        const product =
            await productRepository.findProductById(
                undefined,
                productId,
            );

        const existing =
            productValidation.ensureProductExists(
                product,
            );

        productValidation.ensureProductIsActive(
            existing,
        );

        await productRepository.incrementView(
            undefined,
            productId,
        );

        return existing;
    }

    /**
     * Complete a product.
     *
     * This ONLY records completion.
     *
     * No rewards.
     * No wallet updates.
     * No transactions.
     * No daily-order logic.
     */
    async completeProduct(
        userId: string,
        productId: string,
    ) {

        const product =
            await productRepository.findProductById(
                undefined,
                productId,
            );

        const existing =
            productValidation.ensureProductExists(
                product,
            );

        productValidation.ensureProductIsActive(
            existing,
        );

        return rewardEngineService.processCompletion({
            userId,
            advertisementId: productId,
        });
    }

}

export const productService =
    new ProductService();