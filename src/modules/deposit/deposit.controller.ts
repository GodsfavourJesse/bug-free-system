import { Request, Response } from "express";

import { depositService } from "./deposit.service";

import {
    createDepositSchema,
} from "./deposit.dto";


export class DepositController {

    /**
     * User submits a deposit request.
     */
    async requestDeposit(
        req: Request,
        res: Response,
    ) {
        const dto =
            createDepositSchema.parse(
                req.body,
            );

        const deposit =
            await depositService.requestDeposit(
                req.user!.id,
                dto,
            );

        return res.status(201).json({
            success: true,
            message:
                "Deposit request submitted successfully.",
            data: deposit,
        });
    }

    /**
     * Return all deposits
     * belonging to the authenticated user.
     */
    async findMyDeposits(
        req: Request,
        res: Response,
    ) {
        const deposits =
            await depositService.findMyDeposits(
                req.user!.id,
            );

        return res.json({
            success: true,
            data: deposits,
        });
    }

    /**
     * Return one deposit.
     */
    async findDeposit(
        req: Request,
        res: Response,
    ) {
        const depositId = String(req.params.depositId);

        const deposit =
            await depositService.findDeposit(
                req.user!.id,
                depositId,
            );

        return res.json({
            success: true,
            data: deposit,
        });
    }

    /**
     * Cancel a pending deposit.
     */
    async cancelDeposit(
        req: Request,
        res: Response,
    ) {
        const depositId = String(req.params.depositId);

        const deposit =
            await depositService.findDeposit(
                req.user!.id,
                depositId,
            );

        return res.json({
            success: true,
            message:
                "Deposit request cancelled successfully.",
            data: deposit,
        });
    }

    /**
     * Return one deposit by reference.
     */
    async findDepositByReference(
        req: Request,
        res: Response,
    ) {
        const reference = String(
            req.params.reference,
        );

        const deposit =
            await depositService.findDepositByReference(
                req.user!.id,
                reference,
            );

        return res.json({
            success: true,
            data: deposit,
        });
    }

    /**
     * Return current pending deposit (if any).
     */
    async getPendingDeposit(
        req: Request,
        res: Response,
    ) {
        const result =
            await depositService.getPendingDeposit(
                req.user!.id,
            );

        return res.json({
            success: true,
            data: result,
        });
    }
}

export const depositController =
    new DepositController();