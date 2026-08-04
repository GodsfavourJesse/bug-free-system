import { Request, Response, NextFunction } from "express";
import { transactionService } from "./transaction.service";

interface TransactionIdParams {
    id: string;
}

interface TransactionReferenceParams {
    reference: string;
}

interface TransactionQuery {
    page?: string;
    limit?: string;
}

export class TransactionController {

     // GET /transactions
    // Returns paginated transactions belonging to the authenticated user.
    async getUserTransactions(
        req: Request<{}, {}, {}, TransactionQuery>,
        res: Response,
        next: NextFunction,
    ) {
        try {

            const page = Number(
                req.query.page ?? 1,
            );

            const limit = Number(
                req.query.limit ?? 20,
            );


            const transactions =
                await transactionService.findByUser(
                    req.user!.id,
                    page,
                    limit,
                );


            return res.status(200).json({
                success: true,
                ...transactions,
            });

        } catch (error) {
            next(error);
        }
    }

    // GET /transactions/:id
    async getTransactionById(
        req: Request<TransactionIdParams>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const transaction = await transactionService.findById(
                req.params.id,
            );

            return res.status(200).json({
                success: true,
                data: transaction,
            });

        } catch (error) {
            next(error);
        }
    }

    // GET /transactions/reference/:reference
    async getTransactionByReference(
        req: Request<TransactionReferenceParams>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const transaction = await transactionService.findByReference(
                req.params.reference,
            );

            return res.status(200).json({
                success: true,
                data: transaction,
            });

        } catch (error) {
            next(error);
        }
    }
}

export const transactionController =
    new TransactionController();