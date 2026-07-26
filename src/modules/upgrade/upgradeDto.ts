// Data sent by the authenticated user

import { PaymentMethod } from "../../database/enums/upgrade.enum";

// when requesting a membership upgrade.
export interface CreateUpgradeRequestDto {

    requestedMembershipPlanId: string;

    paymentMethod: PaymentMethod;

    paymentProof?: string;

    metadata?: Record<string, unknown>;
}