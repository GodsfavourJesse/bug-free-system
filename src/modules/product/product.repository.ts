import { DbExecutor } from "../../database/types/types";
import { db } from "../../database";

import { advertisementRepository } from "../admin/advertisement/advertisement.repository";

export class ProductRepository {

    /**
     * Get all products available
     * to the authenticated user.
     *
     * For now this simply returns
     * every active advertisement.
     *
     * Later this will filter by:
     *
     * - Membership
     * - Daily Order Config
     * - Product availability
     */
    async findAvailableProducts(
        executor: DbExecutor = db,
        userId: string,
    ) {
        void userId;

        return advertisementRepository.findActive(
            executor,
        );
    }

    /**
     * Get a single product.
     */
    async findProductById(
        executor: DbExecutor = db,
        productId: string,
    ) {
        return advertisementRepository.findById(
            executor,
            productId,
        );
    }

    /**
     * Increment product views.
     */
    async incrementView(
        executor: DbExecutor = db,
        productId: string,
    ) {
        return advertisementRepository.incrementViews(
            executor,
            productId,
        );
    }

}

export const productRepository =
    new ProductRepository();