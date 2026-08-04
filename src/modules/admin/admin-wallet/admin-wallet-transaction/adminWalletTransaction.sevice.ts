import { db } from "../../../../database";
import { DbExecutor } from "../../../../database/types/types";
import { adminWalletTransactionRepository } from "./adminWalletTransaction.repository";

export class AdminWalletTransactionService {

    async getTransactions(
        executor: DbExecutor = db,
    ) {
        return adminWalletTransactionRepository
            .findAll(
                executor
            );
    }

    async createTransaction(
        executor: DbExecutor,
        data: any,
    ) {
        return adminWalletTransactionRepository
            .create(
                executor,
                data
            );
    }
}

export const adminWalletTransactionService = new AdminWalletTransactionService();