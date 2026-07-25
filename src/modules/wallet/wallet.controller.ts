import { Request, Response, NextFunction } from "express";

import { walletService } from "./wallet.service";

export class WalletController {

    // Returns the authenticated user's wallet.
    async getWallet(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const wallet =
                await walletService.getWallet(
                    req.user!.id,
                );

            res.status(200).json({
                success: true,
                data: wallet,
            });

        } catch (error) {
            next(error);
        }
    }

    // Returns only the wallet balances.
    async getBalance(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const balance =
                await walletService.getBalance(
                    req.user!.id,
                );

            res.status(200).json({
                success: true,
                data: balance,
            });

        } catch (error) {
            next(error);
        }
    }
}

export const walletController =
    new WalletController();