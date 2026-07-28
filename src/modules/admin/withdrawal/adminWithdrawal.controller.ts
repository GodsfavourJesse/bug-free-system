import { Request, Response } from "express";

import { adminWithdrawalService } from "./adminWithdrawal.service";

export class AdminWithdrawalController {

    /**
     * Return every withdrawal request.
     */
    async findAll(
        req: Request,
        res: Response,
    ) {
        const withdrawals =
            await adminWithdrawalService.findAll();

        return res.status(200).json({
            success: true,
            data: withdrawals,
        });
    }

    /**
     * Return one withdrawal request.
     */
    async findById(
        req: Request,
        res: Response,
    ) {
        const withdrawalId =
            Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;

        const withdrawal =
            await adminWithdrawalService.findById(
                withdrawalId,
            );

        return res.status(200).json({
            success: true,
            data: withdrawal,
        });
    }

    /**
     * Approve a withdrawal request.
     */
    async approve(
        req: Request,
        res: Response,
    ) {
        const withdrawalId =
            Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;

        const withdrawal =
            await adminWithdrawalService.approve(
                withdrawalId,
                req.user!.id,
                req.body.adminRemark,
            );

        return res.status(200).json({
            success: true,
            message:
                "Withdrawal approved successfully.",
            data: withdrawal,
        });
    }

    /**
     * Reject a withdrawal request.
     */
    async reject(
        req: Request,
        res: Response,
    ) {
        const withdrawalId =
            Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;

        const withdrawal =
            await adminWithdrawalService.reject(
                withdrawalId,
                req.user!.id,
                req.body.adminRemark,
            );

        return res.status(200).json({
            success: true,
            message:
                "Withdrawal rejected successfully.",
            data: withdrawal,
        });
    }

    /**
     * Mark an approved withdrawal
     * as paid.
     */
    async markPaid(
        req: Request,
        res: Response,
    ) {
        const withdrawalId =
            Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;

        const withdrawal =
            await adminWithdrawalService.markPaid(
                withdrawalId,
                req.user!.id,
            );

        return res.status(200).json({
            success: true,
            message:
                "Withdrawal marked as paid.",
            data: withdrawal,
        });
    }
}

export const adminWithdrawalController =
    new AdminWithdrawalController();