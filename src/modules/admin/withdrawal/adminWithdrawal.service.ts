import { withdrawalValidation } from "../../withdrawal/withdrawal.validation";
import { withdrawalService } from "../../withdrawal/withdrawal.service";
import { adminWithdrawalRepository } from "./adminWIthdrawal.repository";

export class AdminWithdrawalService {

    /**
     * Return every withdrawal request
     * with user information.
     */
    async findAll() {
        return adminWithdrawalRepository.findAll();
    }

    /**
     * Return one withdrawal request
     * with user information.
     */
    async findById(
        id: string,
    ) {
        const withdrawal =
            await adminWithdrawalRepository.findById(
                undefined,
                id,
            );

        return withdrawalValidation.ensureWithdrawalExists(
            withdrawal,
        );
    }

    /**
     * Approve a withdrawal request.
     */
    async approve(
        withdrawalId: string,
        adminId: string,
        adminRemark?: string,
    ) {
        return withdrawalService.approveWithdrawal({
            withdrawalId,
            adminId,
            adminRemark,
        });
    }

    /**
     * Reject a withdrawal request.
     */
    async reject(
        withdrawalId: string,
        adminId: string,
        adminRemark: string,
    ) {
        return withdrawalService.rejectWithdrawal({
            withdrawalId,
            adminId,
            adminRemark,
        });
    }

    /**
     * Mark an approved withdrawal
     * as paid.
     */
    async markPaid(
        withdrawalId: string,
        adminId: string,
    ) {
        return withdrawalService.markPaid({
            withdrawalId,
            adminId,
        });
    }
}

export const adminWithdrawalService = new AdminWithdrawalService();