import { CommissionSource } from "@/constants/commision.constants";

/**
 * Data required to process a commission event.
 *
 * One purchase/upgrade can generate
 * multiple commission payouts.
 */
export interface ProcessCommissionDto {

    // User who made the purchase.
    buyerId: string;

    // Membership plan purchased/upgraded to.
    membershipPlanId: string;

    // Purchase amount.
    amount: number;

    // Purchase source.
    source: CommissionSource;

    // Transaction reference.
    reference: string;
}

/**
 * Data required to create
 * one commission payout.
 *
 * Used internally after the
 * referral hierarchy is resolved.
 */
export interface CreateCommissionDto {

    // Recipient of the commission.
    recipientId: string;

    // Buyer who generated it.
    buyerId: string;

    // Membership plan purchased.
    membershipPlanId: string;

    // Referral level.
    level: 1 | 2 | 3;

    // Purchase amount.
    amount: number;

    // Source transaction.
    reference: string;

    // Purchase source.
    source: CommissionSource;
}