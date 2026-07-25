import { Request, Response } from "express";

import { withdrawalService } from "./withdrawal.service";

export class WithdrawalController {

    // Create a withdrawal request.
    async createWithdrawal(
        req: Request,
        res: Response,
    ) {
        const withdrawal =
            await withdrawalService.createWithdrawal({
                userId: req.user!.id,

                amount: req.body.amount,

                accountName:
                    req.body.accountName,

                accountNumber:
                    req.body.accountNumber,

                bankName:
                    req.body.bankName,
            });

        return res.status(201).json({
            success: true,
            message:
                "Withdrawal request submitted successfully.",
            data: withdrawal,
        });
    }

    // Get every withdrawal belonging to the logged-in user.
    async getUserWithdrawals(
        req: Request,
        res: Response,
    ) {

        const withdrawals =
            await withdrawalService.getUserWithdrawals(
                req.user!.id,
            );

        return res.status(200).json({
            success: true,
            data: withdrawals,
        });
    }

    // Get one withdrawal.
    async getWithdrawal(
        req: Request,
        res: Response,
    ) {

        const withdrawalId =
            Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;

        const withdrawal =
            await withdrawalService.getWithdrawal(
                withdrawalId,
            );

        return res.status(200).json({
            success: true,
            data: withdrawal,
        });
    }

    // Approve a withdrawal request.
    async approveWithdrawal(
        req: Request,
        res: Response,
    ) {

        const withdrawalId =
            Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;

        const withdrawal =
            await withdrawalService.approveWithdrawal({
                withdrawalId,

                adminId: req.user!.id,

                adminRemark:
                    req.body.adminRemark,
            });

        return res.status(200).json({
            success: true,
            message:
                "Withdrawal approved successfully.",
            data: withdrawal,
        });
    }

    // Reject a withdrawal request.
    async rejectWithdrawal(
        req: Request,
        res: Response,
    ) {

        const withdrawalId =
            Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;

        const withdrawal =
            await withdrawalService.rejectWithdrawal({
                withdrawalId,

                adminId: req.user!.id,

                adminRemark:
                    req.body.adminRemark,
            });

        return res.status(200).json({
            success: true,
            message:
                "Withdrawal rejected successfully.",
            data: withdrawal,
        });
    }

    // Mark a withdrawal as paid.
    async markPaid(
        req: Request,
        res: Response,
    ) {

        const withdrawalId =
            Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;

        const withdrawal =
            await withdrawalService.markPaid({
                withdrawalId,

                adminId: req.user!.id,
            });

        return res.status(200).json({
            success: true,
            message:
                "Withdrawal marked as paid.",
            data: withdrawal,
        });
    }
}

export const withdrawalController =
    new WithdrawalController();