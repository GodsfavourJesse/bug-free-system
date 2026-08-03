import {
    AdminDepositDto,
    AdminDepositUserDto,
} from "./adminDeposit.dto";

export class AdminDepositMapper {

    /**
     * ----------------------------------------
     * Map joined user
     * ----------------------------------------
     */
    toUser(
        user: any,
        membership: any,
    ): AdminDepositUserDto {

        return {
            id: user.id,

            phone: user.phone,

            email: user.email,

            membership:
                membership
                    ? {
                        id:
                            membership.id,

                        name:
                            membership.name,

                        slug:
                            membership.slug,
                    }
                    : null,
        };
    }

    /**
     * ----------------------------------------
     * Map joined deposit
     * ----------------------------------------
     */
    toDto(
        entity: any,
    ): AdminDepositDto {

        const {
            deposit,
            user,
            membership,
        } = entity;

        return {
            id:
                deposit.id,

            reference:
                deposit.reference,

            walletId:
                deposit.walletId,

            amount:
                deposit.amount,

            accountName:
                deposit.accountName,

            accountNumber:
                deposit.accountNumber,

            bankName:
                deposit.bankName,

            paymentReceipt:
                deposit.paymentReceipt,

            status:
                deposit.status,

            reviewedBy:
                deposit.reviewedBy,

            reviewedAt:
                deposit.reviewedAt,

            adminRemark:
                deposit.adminRemark,

            metadata:
                deposit.metadata,

            createdAt:
                deposit.createdAt,

            updatedAt:
                deposit.updatedAt,

            user:
                this.toUser(
                    user,
                    membership,
                ),
        };
    }

    /**
     * ----------------------------------------
     * Map collection
     * ----------------------------------------
     */
    toDtoList(
        entities: any[],
    ): AdminDepositDto[] {

        return entities.map(
            (entity) =>
                this.toDto(
                    entity,
                ),
        );
    }

}

export const adminDepositMapper =
    new AdminDepositMapper();