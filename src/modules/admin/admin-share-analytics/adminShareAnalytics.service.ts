import { AdminShareAnalyticsDto } from "./adminShareAnalytics.dto";
import { AdminShareAnalyticsNotFoundError } from "./adminShareAnalytics.errors";
import {
    adminShareAnalyticsRepository,
} from "./adminShareAnalytics.repository";


export class AdminShareAnalyticsService {

    /**
     * Get complete analytics for one share.
     */
    async getAnalytics(
        shareId: string,
    ): Promise<AdminShareAnalyticsDto> {

        /**
         * 1. Verify share exists.
         */
        const share =
            await adminShareAnalyticsRepository.findShare(
                undefined,
                shareId,
            );


        if (!share) {
            throw new AdminShareAnalyticsNotFoundError();
        }


        /**
         * 2. Calculate financial analytics.
         */
        const analytics =
            await adminShareAnalyticsRepository.getAnalytics(
                undefined,
                shareId,
            );


        /**
         * 3. Return normalized response.
         */
        return {

            share: {
                id:
                    share.id,

                name:
                    share.name,

                logo:
                    share.logo,

                description:
                    share.description,

                dailyReturnPercentage:
                    share.dailyReturnPercentage,

                cycleDays:
                    share.cycleDays,

                status:
                    share.status,

                createdAt:
                    share.createdAt,

                updatedAt:
                    share.updatedAt,
            },

            totalPurchasers:
                analytics.totalPurchasers,

            totalPurchaseAmount:
                analytics.totalPurchaseAmount,

            totalExpectedReturns:
                analytics.totalExpectedReturns,

            totalReturnsCredited:
                analytics.totalReturnsCredited,

            remainingLiability:
                analytics.remainingLiability,
        };
    }
}


export const adminShareAnalyticsService =
    new AdminShareAnalyticsService();