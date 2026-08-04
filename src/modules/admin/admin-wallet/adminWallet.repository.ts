import { eq } from "drizzle-orm";
import { DbExecutor } from "../../../database/types/types";
import { db } from "../../../database";
import { users, wallets } from "../../../database/schema";
import { USER_ROLES } from "../../../constants/roles";

export class AdminWalletRepository {

    // Find the admin wallet
    async findWallet(
        executor: DbExecutor = db,
    ) {
        const [result] = await executor
            .select({
                user: users,
                wallet: wallets,
            })
            .from(users)
            .innerJoin(
                wallets,
                eq(users.id, wallets.userId),
            )
            .where(
                eq(
                    users.role,
                    USER_ROLES.ADMIN,
                ),
            )
            .limit(1);

        return result ?? null;
    }

    // Update available balance
    async updateAvailableBalance(
        executor: DbExecutor = db,
        walletId: string,
        balance: string,
    ) {
        const [wallet] = await executor
            .update(wallets)
            .set({
                availableBalance: balance,
            })
            .where(
                eq(
                    wallets.id,
                    walletId,
                ),
            )
            .returning();

        return wallet;
    }

    // Update total deposited
    async updateTotalDeposited(
        executor: DbExecutor = db,
        walletId: string,
        totalDeposited: string,
    ) {
        const [wallet] = await executor
            .update(wallets)
            .set({
                totalDeposited,
            })
            .where(
                eq(
                    wallets.id,
                    walletId,
                ),
            )
            .returning();

        return wallet;
    }

    // Lock admin wallet
    async lockWallet(
        executor: DbExecutor = db,
    ) {
        const [result] = await executor
            .select({
                user: users,
                wallet: wallets,
            })
            .from(users)
            .innerJoin(
                wallets,
                eq(
                    users.id,
                    wallets.userId,
                ),
            )
            .where(
                eq(
                    users.role,
                    USER_ROLES.ADMIN,
                ),
            )
            .for("update")
            .limit(1);

        return result ?? null;
    }
}

export const adminWalletRepository =
    new AdminWalletRepository();