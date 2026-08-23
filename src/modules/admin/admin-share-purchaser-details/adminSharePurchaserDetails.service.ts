import {
    AdminSharePurchaserDetailsResponseDto,
} from "./adminSharePurchaserDetails.dto";
import { AdminSharePurchaserNotFoundError, AdminSharePurchaserShareNotFoundError } from "../admin-share-purchaser/adminSharePurchaser.errors";
import { adminSharePurchaserDetailsRepository } from "./adminSharePurchaserDetails.repository";


export class AdminSharePurchaserDetailsService {

    /**
     * Get details of one purchaser.
     */
    async getPurchaseDetails(
        shareId: string,
        purchaseId: string,
    ): Promise<
        AdminSharePurchaserDetailsResponseDto
    > {

        /**
         * 1. Verify share exists.
         */
        const share =
            await adminSharePurchaserDetailsRepository.findShare(
                undefined,
                shareId,
            );

        if (!share) {
            throw new AdminSharePurchaserShareNotFoundError();
        }


        /**
         * 2. Find purchase.
         *
         * The repository also verifies
         * that the purchase belongs
         * to this share.
         */
        const purchase =
            await adminSharePurchaserDetailsRepository
                .findPurchaseDetails(
                    undefined,
                    shareId,
                    purchaseId,
                );


        if (!purchase) {
            throw new AdminSharePurchaserNotFoundError();
        }


        /**
         * 3. Normalize database values
         * into the API response.
         */
        const data = {

            purchaseId:
                purchase.purchaseId,


            share: {

                id:
                    purchase.shareId,

                name:
                    purchase.shareName,

                logo:
                    purchase.shareLogo,

                description:
                    purchase.shareDescription,

                dailyReturnPercentage:
                    Number(
                        purchase
                            .shareDailyReturnPercentage,
                    ).toFixed(4),

                cycleDays:
                    purchase.shareCycleDays,

                status:
                    purchase.shareStatus,
            },


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
                    purchase.dailyReturnAmount,
                ).toFixed(2),


            totalReturn:
                Number(
                    purchase.totalReturnAmount,
                ).toFixed(2),


            dailyReturnPercentage:
                Number(
                    purchase.dailyReturnPercentage,
                ).toFixed(4),


            cycleDays:
                purchase.cycleDays,


            status:
                purchase.status,


            purchasedAt:
                purchase.purchasedAt,


            expectedReturnAt:
                purchase.expectedReturnAt,


            expiresAt:
                purchase.expiresAt,


            returnedAt:
                purchase.returnedAt,


            returnAmount:
                purchase.returnAmount !== null
                    ? Number(
                        purchase.returnAmount,
                    ).toFixed(2)
                    : null,


            returnReference:
                purchase.returnReference,
        };


        return {
            data,
        };
    }
}


export const adminSharePurchaserDetailsService =
    new AdminSharePurchaserDetailsService();