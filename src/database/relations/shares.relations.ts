import {
    relations,
} from "drizzle-orm";
import { sharePurchases, shares, users, wallets } from "../schema";


export const sharesRelations =
    relations(
        shares,
        ({ one, many }) => ({
            creator: one(users, {
                fields: [
                    shares.createdBy,
                ],
                references: [
                    users.id,
                ],
            }),

            purchases: many(
                sharePurchases,
            ),
        }),
    );

export const sharePurchasesRelations =
    relations(
        sharePurchases,
        ({ one }) => ({
            user: one(users, {
                fields: [
                    sharePurchases.userId,
                ],
                references: [
                    users.id,
                ],
            }),

            share: one(shares, {
                fields: [
                    sharePurchases.shareId,
                ],
                references: [
                    shares.id,
                ],
            }),

            wallet: one(wallets, {
                fields: [
                    sharePurchases.walletId,
                ],
                references: [
                    wallets.id,
                ],
            }),
        }),
    );