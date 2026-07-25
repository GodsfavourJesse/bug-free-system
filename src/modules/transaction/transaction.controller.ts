import { Request, Response, NextFunction } from "express";
import { transactionService } from "./transaction.service";

interface TransactionIdParams {
    id: string;
}

interface TransactionReferenceParams {
    reference: string;
}

export class TransactionController {

    // GET /transactions
    // Returns every transaction belonging to the authenticated user.
    async getUserTransactions(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const transactions = await transactionService.findByUser(
                req.user!.id,
            );

            return res.status(200).json({
                success: true,
                data: transactions,
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