import { PaymentMethod } from "../../database/enums/upgrade.enum";

// when requesting a membership upgrade.
export interface CreateUpgradeRequestDto {
    requestedMembershipPlanId: string;
    paymentMethod: PaymentMethod;
    paymentProof?: string;
    metadata?: Record<string, unknown>;
}

export interface UpgradeCheckItem {
    key: string;
    title: string;
    description: string;
    passed: boolean;
}

export interface UpgradeFailedCheckItem {
    key: string;
    message: string;
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

    checks: UpgradeCheckItem[];

    failedChecks: UpgradeFailedCheckItem[];

    reason: string | null;
}