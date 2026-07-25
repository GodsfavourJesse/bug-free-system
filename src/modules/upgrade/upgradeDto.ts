import { PaymentMethod } from "@/database/enums/upgrade.enum";

// Data sent by the authenticated user
// when requesting a membership upgrade.
export interface CreateUpgradeRequestDto {

    requestedMembershipPlanId: string;

    paymentMethod: PaymentMethod;

    paymentProof?: string;

    metadata?: Record<string, unknown>;
}