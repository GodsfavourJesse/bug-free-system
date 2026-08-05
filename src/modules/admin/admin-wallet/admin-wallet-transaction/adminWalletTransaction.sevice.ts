import { db } from "../../../../database";
import { DbExecutor } from "../../../../database/types/types";
import { CreateAdminWalletTransactionDto } from "../../../transaction/transactionDto";
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
        data: CreateAdminWalletTransactionDto,
    ) {
        return adminWalletTransactionRepository
            .create(
                executor,
                data,
            );
    }
}

export const adminWalletTransactionService = new AdminWalletTransactionService();