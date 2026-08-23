import {
    AdminSharePurchaserListResponseDto,
} from "./adminSharePurchaser.dto";

import {
    AdminSharePurchaserShareNotFoundError,
} from "./adminSharePurchaser.errors";

import {
    adminSharePurchaserRepository,
} from "./adminSharePurchaser.repository";


export class AdminSharePurchaserService {

    /**
     * Get paginated purchasers for a share.
     */
    async getPurchasers(
        shareId: string,
        page: number = 1,
        limit: number = 20,
    ): Promise<AdminSharePurchaserListResponseDto> {

        /**
         * Normalize pagination.
         */
        page =
            Number.isFinite(page)
                ? Math.floor(page)
                : 1;

        limit =
            Number.isFinite(limit)
                ? Math.floor(limit)
                : 20;


        page =
            Math.max(
                1,
                page,
            );

        limit =
            Math.min(
                100,
                Math.max(
                    1,
                    limit,
                ),
            );


        /**
         * Verify share exists.
         */
        const share =
            await adminSharePurchaserRepository.findShare(
                undefined,
                shareId,
            );


        if (!share) {
            throw new AdminSharePurchaserShareNotFoundError();
        }


        /**
         * Get purchasers.
         */
        const result =
            await adminSharePurchaserRepository.findPurchasers(
                undefined,
                shareId,
                page,
                limit,
            );


        /**
         * Calculate pagination.
         */
        const totalPages =
            Math.ceil(
                result.total / limit,
            );


        /**
         * Normalize database values
         * into API response.
         */
        const data =
            result.data.map(
                (purchase) => ({
                    purchaseId:
                        purchase.purchaseId,

                    user: {
                        id:
                            purchase.userId,

                        phone:
                            purchase.userPhone,

                        email:
                            purchase.userEmail,
                    },

                    purchaseAmount:
                        Number(
                            purchase.purchaseAmount,
                        ).toFixed(2),

                    dailyReturn:
                        Number(
                            purchase.dailyReturn,
                        ).toFixed(2),

                    totalReturn:
                        Number(
                            purchase.totalReturn,
                        ).toFixed(2),

                    status:
                        purchase.status,

                    purchasedAt:
                        purchase.purchasedAt,

                    expectedReturnAt:
                        purchase.expectedReturnAt,

                    expiresAt:
                        purchase.expiresAt,
                }),
            );


        return {

            data,

            pagination: {

                page,

                limit,

                total:
                    result.total,

                totalPages,

                hasNextPage:
                    page < totalPages,

                hasPreviousPage:
                    page > 1,

            },
        };
    }
}


export const adminSharePurchaserService =
    new AdminSharePurchaserService();