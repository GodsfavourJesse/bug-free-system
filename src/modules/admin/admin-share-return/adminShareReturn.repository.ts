import {
    eq,
} from "drizzle-orm";

import {
    sharePurchases,
    shares,
} from "../../../database/schema";

import {
    DbExecutor,
} from "../../../database/types/types";

import {
    sharePurchaseStatus,
} from "../../../database/enums/share.enum";


export class AdminShareReturnRepository {

    /**
     * Lock a share purchase for return processing.
     *
     * The purchase row is locked using
     * SELECT ... FOR UPDATE so that two
     * concurrent return operations cannot
     * process the same purchase at the same time.
     *
     * The associated share name is also loaded
     * because it is useful when creating the
     * financial transaction description/metadata.
     */
    async lockById(
        executor: DbExecutor,
        id: string,
    ) {

        const [purchase] =
            await executor
                .select({

                    id:
                        sharePurchases.id,

                    userId:
                        sharePurchases.userId,

                    shareId:
                        sharePurchases.shareId,

                    walletId:
                        sharePurchases.walletId,

                    purchaseAmount:
                        sharePurchases.purchaseAmount,

                    dailyReturnPercentage:
                        sharePurchases.dailyReturnPercentage,

                    dailyReturnAmount:
                        sharePurchases.dailyReturnAmount,

                    cycleDays:
                        sharePurchases.cycleDays,

                    totalReturnAmount:
                        sharePurchases.totalReturnAmount,

                    expiresAt:
                        sharePurchases.expiresAt,

                    status:
                        sharePurchases.status,

                    returnReference:
                        sharePurchases.returnReference,

                    returnCreditedAt:
                        sharePurchases.returnCreditedAt,

                    createdAt:
                        sharePurchases.createdAt,

                    updatedAt:
                        sharePurchases.updatedAt,

                    /**
                     * Share information.
                     */
                    shareName:
                        shares.name,
                })
                .from(sharePurchases)
                .innerJoin(
                    shares,
                    eq(
                        sharePurchases.shareId,
                        shares.id,
                    ),
                )
                .where(
                    eq(
                        sharePurchases.id,
                        id,
                    ),
                )
                .limit(1)
                .for("update");

        return purchase ?? null;
    }


    /**
     * Mark a share purchase as having
     * its return credited.
     *
     * IMPORTANT:
     *
     * This method must only be called after
     * lockById() has locked the purchase inside
     * the same database transaction.
     */
    async markReturnCredited(
        executor: DbExecutor,
        purchaseId: string,
        returnReference: string,
        returnCreditedAt: Date = new Date(),
    ) {

        const [purchase] =
            await executor
                .update(
                    sharePurchases,
                )
                .set({

                    status:
                        sharePurchaseStatus.RETURN_CREDITED,

                    returnReference,

                    returnCreditedAt,
                })
                .where(
                    eq(
                        sharePurchases.id,
                        purchaseId,
                    ),
                )
                .returning();

        return purchase ?? null;
    }
}


export const adminShareReturnRepository =
    new AdminShareReturnRepository();