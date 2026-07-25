import { eq } from "drizzle-orm";
import { DbExecutor } from "@/database/types/types";
import { wallets } from "@/database/schema";

// Drizzle transaction and database instances expose
// the same query methods we use here, so both can be
// passed into the repository.

export class WalletRepository {

    // Create a wallet.
    async create(
        executor: DbExecutor,
        userId: string,
    ) {
        const [wallet] = await executor
            .insert(wallets)
            .values({
                userId,
            })
            .returning();

        return wallet;
    }

    // Find wallet by wallet ID.
    async findById(
        executor: DbExecutor,
        id: string,
    ) {
        const [wallet] = await executor
            .select()
            .from(wallets)
            .where(eq(wallets.id, id))
            .limit(1);

        return wallet ?? null;
    }

    // Find wallet by user ID.
    async findByUserId(
        executor: DbExecutor,
        userId: string,
    ) {
        const [wallet] = await executor
            .select()
            .from(wallets)
            .where(eq(wallets.userId, userId))
            .limit(1);

        return wallet ?? null;
    }

    // Update wallet balances.
    // Business logic belongs in WalletService.
    async updateBalances(
        executor: DbExecutor,
        walletId: string,
        balances: {
            availableBalance?: string;
            heldBalance?: string;
            totalEarned?: string;
            totalDeposited?: string;
            totalWithdrawn?: string;
        },
    ) {
        const [wallet] = await executor
            .update(wallets)
            .set(balances)
            .where(eq(wallets.id, walletId))
            .returning();

        return wallet;
    }

    // Update wallet after a commission credit.
    // Must be called inside a transaction.
    async creditCommission(
        executor: DbExecutor,
        walletId: string,
        availableBalance: string,
        totalEarned: string,
    ) {
        const [wallet] = await executor
            .update(wallets)
            .set({
                availableBalance,
                totalEarned,
            })
            .where(
                eq(wallets.id, walletId),
            )
            .returning();

        return wallet;
    }

    // Lock wallet row.
    // Must be called inside a transaction.
    async lockByUserId(
        executor: DbExecutor,
        userId: string,
    ) {
        const [wallet] = await executor
            .select()
            .from(wallets)
            .where(eq(wallets.userId, userId))
            .limit(1)
            .for("update");

        return wallet ?? null;
    }
}

export const walletRepository =
    new WalletRepository();