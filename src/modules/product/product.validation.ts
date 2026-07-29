import { AdvertisementStatus } from "../../database/enums/advertisement.enum";
import { Advertisement } from "../admin/advertisement/advertisement.dto";
import { ProductNotActiveError, ProductNotFoundError } from "./product.errors";

export class ProductValidation {

    /**
     * Ensure the product exists.
     */
    ensureProductExists(
        product: Advertisement | null,
    ): Advertisement {

        if (!product) {
            throw new ProductNotFoundError();
        }

        return product;
    }

    /**
     * Ensure the product is active.
     */
    ensureProductIsActive(
        product: Advertisement,
    ): Advertisement {

        if (
            product.status !==
            AdvertisementStatus.ACTIVE
        ) {
            throw new ProductNotActiveError();
        }

        return product;
    }

}

export const productValidation =
    new ProductValidation();