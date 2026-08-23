import {
    eq,
    sql,
} from "drizzle-orm";

import { db } from "../../../database";

import {
    shares,
    sharePurchases,
} from "../../../database/schema";

import {
    DbExecutor,
} from "../../../database/types/types";
import { sharePurchaseStatus } from "../../../database/enums/share.enum";


export class AdminShareAnalyticsRepository {

    /**
     * Get aggregated analytics for a share.
     *
     * All financial calculations are performed
     * directly by PostgreSQL.
     */
    async getAnalytics(
        executor: DbExecutor = db,
        shareId: string,
    ) {

        const [result] =
            await executor
                .select({

                    /**
                     * Number of unique users who
                     * purchased this share.
                     */
                    totalPurchasers:
                        sql<number>`
                            COUNT(
                                DISTINCT ${sharePurchases.userId}
                            )
                        `.mapWith(Number),

                    /**
                     * Total amount paid by users
                     * for this share.
                     */
                    totalPurchaseAmount:
                        sql<string>`
                            COALESCE(
                                SUM(
                                    ${sharePurchases.purchaseAmount}
                                ),
                                0
                            )
                        `,

                    /**
                     * Total amount users are expected
                     * to receive at the end of their
                     * share cycles.
                     */
                    totalExpectedReturns:
                        sql<string>`
                            COALESCE(
                                SUM(
                                    ${sharePurchases.totalReturnAmount}
                                ),
                                0
                            )
                        `,

                    /**
                     * Total returns that have already
                     * been credited.
                     *
                     * A purchase becomes RETURNED after
                     * the admin credits its return.
                     */
                    totalReturnsCredited:
                        sql<string>`
                            COALESCE(
                                SUM(
                                    CASE
                                        WHEN ${sharePurchases.status}
                                            = ${sharePurchaseStatus.RETURN_CREDITED}
                                        THEN ${sharePurchases.totalReturnAmount}
                                        ELSE 0
                                    END
                                ),
                                0
                            )
                        `,
                })
                .from(sharePurchases)
                .where(
                    eq(
                        sharePurchases.shareId,
                        shareId,
                    ),
                );


        if (!result) {
            return {
                totalPurchasers: 0,

                totalPurchaseAmount: "0.00",

                totalExpectedReturns: "0.00",

                totalReturnsCredited: "0.00",

                remainingLiability: "0.00",
            };
        }


        const totalPurchaseAmount =
            Number(
                result.totalPurchaseAmount ?? 0,
            );

        const totalExpectedReturns =
            Number(
                result.totalExpectedReturns ?? 0,
            );

        const totalReturnsCredited =
            Number(
                result.totalReturnsCredited ?? 0,
            );


        const remainingLiability =
            Math.max(
                0,
                totalExpectedReturns -
                totalReturnsCredited,
            );


        return {

            totalPurchasers:
                Number(
                    result.totalPurchasers ?? 0,
                ),

            totalPurchaseAmount:
                totalPurchaseAmount.toFixed(2),

            totalExpectedReturns:
                totalExpectedReturns.toFixed(2),

            totalReturnsCredited:
                totalReturnsCredited.toFixed(2),

            remainingLiability:
                remainingLiability.toFixed(2),
        };
    }


    /**
     * Verify that a share exists.
     */
    async findShare(
        executor: DbExecutor = db,
        shareId: string,
    ) {

        const [share] =
            await executor
                .select({
                    id: shares.id,

                    name: shares.name,

                    logo: shares.logo,

                    description:
                        shares.description,

                    dailyReturnPercentage:
                        shares.dailyReturnPercentage,

                    cycleDays:
                        shares.cycleDays,

                    status:
                        shares.status,

                    createdAt:
                        shares.createdAt,

                    updatedAt:
                        shares.updatedAt,
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


export const adminShareAnalyticsRepository =
    new AdminShareAnalyticsRepository();