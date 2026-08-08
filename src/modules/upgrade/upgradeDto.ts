import { PaymentMethod } from "../../database/enums/upgrade.enum";

// when requesting a membership upgrade.
export interface CreateUpgradeRequestDto {
    requestedMembershipPlanId: string;
    paymentMethod: PaymentMethod;
    paymentProof?: string;
    metadata?: Record<string, unknown>;
}

export interface UpgradeValidationResponse {
    canUpgrade: boolean;

    currentPlan: {
        id: string;
        name: string;
        sortOrder: number;
    };

    requestedPlan: {
        id: string;
        name: string;
        sortOrder: number;
        upgradePrice: string;
    };

    wallet: {
        balance: string;
        sufficient: boolean;
    };

    checks: {
        validMembership: boolean;
        sequentialUpgrade: boolean;
        noPendingRequest: boolean;
        sufficientBalance: boolean;
    };

    reason: string | null;
}