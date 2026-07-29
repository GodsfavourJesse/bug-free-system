export class ProductNotFoundError extends Error {

    constructor() {
        super("Product not found.");

        this.name = "ProductNotFoundError";
    }

}

export class ProductNotActiveError extends Error {

    constructor() {
        super("Product is not active.");

        this.name = "ProductNotActiveError";
    }

}