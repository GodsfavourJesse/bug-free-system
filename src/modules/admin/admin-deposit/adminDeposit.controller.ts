import { Request, Response } from "express";

import { adminDepositService } from "./adminDeposit.service";
import { adminDepositMapper } from "./adminDeposit.mapper";

export class AdminDepositController {

    /**
     * ----------------------------------------
     * Return every pending deposit.
     * ----------------------------------------
     */
    async findPendingDeposits(
        req: Request,
        res: Response,
    ) {

        const deposits =
            await adminDepositService.findPendingDeposits();

        return res.json({
            success: true,
            message:
                "Pending deposits retrieved successfully.",
            data:
                adminDepositMapper.toDtoList(
                    deposits,
                ),
        });

    }

    /**
     * ----------------------------------------
     * Approve deposit.
     * ----------------------------------------
     */
    async approveDeposit(
        req: Request,
        res: Response,
    ) {

        const deposit =
            await adminDepositService.approveDeposit(
                req.user!.id,
                String(req.params.depositId),
                req.body,
            );

        return res.json({
            success: true,
            message:
                "Deposit approved successfully.",
            data:
                adminDepositMapper.toDto(
                    deposit,
                ),
        });

    }

    /**
     * ----------------------------------------
     * Reject deposit.
     * ----------------------------------------
     */
    async rejectDeposit(
        req: Request,
        res: Response,
    ) {

        const deposit =
            await adminDepositService.rejectDeposit(
                req.user!.id,
                String(req.params.depositId),
                req.body,
            );

        return res.json({
            success: true,
            message:
                "Deposit rejected successfully.",
            data:
                adminDepositMapper.toDto(
                    deposit,
                ),
        });

    }

    /**
     * ----------------------------------------
     * Return every deposit.
     * ----------------------------------------
     */
    async findAllDeposits(
        req: Request,
        res: Response,
    ) {

        const deposits =
            await adminDepositService.findAllDeposits();

        return res.json({
            success: true,
            message:
                "Deposits retrieved successfully.",
            data:
                adminDepositMapper.toDtoList(
                    deposits,
                ),
        });

    }

    /**
     * ----------------------------------------
     * Return one deposit.
     * ----------------------------------------
     */
    async findDepositById(
        req: Request,
        res: Response,
    ) {

        const deposit =
            await adminDepositService.findDepositById(
                String(req.params.depositId),
            );

        return res.json({
            success: true,
            message:
                "Deposit retrieved successfully.",
            data:
                adminDepositMapper.toDto(
                    deposit,
                ),
        });

    }

}

export const adminDepositController =
    new AdminDepositController();