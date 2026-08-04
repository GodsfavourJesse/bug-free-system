import { Request, Response, NextFunction } from "express";
import { adminWalletTransactionService } from "./adminWalletTransaction.sevice";

export class AdminWalletTransactionController {

    async getTransactions(
        req: Request,
        res: Response,
        next: NextFunction,
    ){
        try {
            const transactions = await adminWalletTransactionService.getTransactions();

            res.status(200).json({
                success:true,
                data: transactions,
            });
        } catch(error){
            next(error);
        }
    }
}

export const adminWalletTransactionController = new AdminWalletTransactionController();