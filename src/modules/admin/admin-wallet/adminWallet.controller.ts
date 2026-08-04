import { Request, Response, NextFunction } from "express";
import { adminWalletService } from "./adminWallet.service";


export class AdminWalletController {

    async getWallet(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {

        try {

            const wallet =
                await adminWalletService.getWallet();

            res.status(200).json({
                success: true,

                data: wallet,
            });


        } catch (error) {

            next(error);

        }
    }
}


export const adminWalletController =
    new AdminWalletController();