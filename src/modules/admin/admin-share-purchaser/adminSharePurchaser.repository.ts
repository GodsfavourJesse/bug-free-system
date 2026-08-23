import {
    count,
    desc,
    eq,
} from "drizzle-orm";

import { db } from "../../../database";

import {
    shares,
    sharePurchases,
    users,
} from "../../../database/schema";

import {
    DbExecutor,
} from "../../../database/types/types";


export class AdminSharePurchaserRepository {

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


    /**
     * Get paginated purchasers for a share.
     *
     * The database performs:
     *
     * shares
     *     ↓
     * sharePurchases
     *     ↓
     * users
     *
     * Pagination is performed at database level.
     */
    async findPurchasers(
        executor: DbExecutor = db,
        shareId: string,
        page: number = 1,
        limit: number = 20,
    ) {

        const offset =
            (page - 1) * limit;


        /**
         * Purchaser list.
         */
        const data =
            await executor
                .select({

                    purchaseId:
                        sharePurchases.id,

                    userId:
                        users.id,

                    userPhone:
                        users.phone,

                    userEmail:
                        users.email,

                    purchaseAmount:
                        sharePurchases.purchaseAmount,

                    dailyReturn:
                        sharePurchases.dailyReturnAmount,

                    totalReturn:
                        sharePurchases.totalReturnAmount,

                    status:
                        sharePurchases.status,

                    purchasedAt:
                        sharePurchases.createdAt,

                    expectedReturnAt:
                        sharePurchases.expectedReturnAt,

                    expiresAt:
                        sharePurchases.expiresAt,
                })
                .from(sharePurchases)
                .innerJoin(
                    users,
                    eq(
                        sharePurchases.userId,
                        users.id,
                    ),
                )
                .where(
                    eq(
                        sharePurchases.shareId,
                        shareId,
                    ),
                )
                .orderBy(
                    desc(
                        sharePurchases.createdAt,
                    ),
                )
                .limit(limit)
                .offset(offset);


        /**
         * Total number of purchasers.
         */
        const [{ total }] =
            await executor
                .select({
                    total: count(),
                })
                .from(sharePurchases)
                .where(
                    eq(
                        sharePurchases.shareId,
                        shareId,
                    ),
                );


        return {
            data,

            total:
                Number(total),
        };
    }
}


export const adminSharePurchaserRepository =
    new AdminSharePurchaserRepository();