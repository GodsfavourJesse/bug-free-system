import {
    and,
    eq,
} from "drizzle-orm";

import {
    db,
} from "../../../database";

import {
    shares,
    sharePurchases,
    users,
} from "../../../database/schema";

import {
    DbExecutor,
} from "../../../database/types/types";


export class AdminSharePurchaserDetailsRepository {

    /**
     * Find a single purchase belonging
     * to a specific share.
     */
    async findPurchaseDetails(
        executor: DbExecutor = db,
        shareId: string,
        purchaseId: string,
    ) {

        const [result] =
            await executor
                .select({
                    purchaseId:
                        sharePurchases.id,

                    purchaseAmount:
                        sharePurchases.purchaseAmount,

                    dailyReturnAmount:
                        sharePurchases.dailyReturnAmount,

                    totalReturnAmount:
                        sharePurchases.totalReturnAmount,

                    dailyReturnPercentage:
                        sharePurchases.dailyReturnPercentage,

                    cycleDays:
                        sharePurchases.cycleDays,

                    status:
                        sharePurchases.status,

                    purchasedAt:
                        sharePurchases.createdAt,

                    expectedReturnAt:
                        sharePurchases.expectedReturnAt,

                    expiresAt:
                        sharePurchases.expiresAt,

                    returnedAt:
                        sharePurchases.returnCreditedAt,

                    returnAmount:
                        sharePurchases.totalReturnAmount,

                    returnReference:
                        sharePurchases.returnReference,

                    /**
                     * User.
                     */
                    userId:
                        users.id,

                    userPhone:
                        users.phone,

                    userEmail:
                        users.email,

                    /**
                     * Share.
                     */
                    shareId:
                        shares.id,

                    shareName:
                        shares.name,

                    shareLogo:
                        shares.logo,

                    shareDescription:
                        shares.description,

                    shareDailyReturnPercentage:
                        shares.dailyReturnPercentage,

                    shareCycleDays:
                        shares.cycleDays,

                    shareStatus:
                        shares.status,
                })
                .from(sharePurchases)
                .innerJoin(
                    users,
                    eq(
                        sharePurchases.userId,
                        users.id,
                    ),
                )
                .innerJoin(
                    shares,
                    eq(
                        sharePurchases.shareId,
                        shares.id,
                    ),
                )
                .where(
                    and(
                        eq(
                            sharePurchases.id,
                            purchaseId,
                        ),

                        eq(
                            sharePurchases.shareId,
                            shareId,
                        ),
                    ),
                )
                .limit(1);

        return result ?? null;
    }

    async findShare(
        executor: DbExecutor = db,
        shareId: string,
    ) {
        const [share] = await executor
            .select({
                id: shares.id,
                name: shares.name,
            })
            .from(shares)
            .where(
                eq(
                    shares.id,
                    shareId,
                ),
            )
            .limit(1);

        return share ?? null;
    }
}


export const adminSharePurchaserDetailsRepository =
    new AdminSharePurchaserDetailsRepository();