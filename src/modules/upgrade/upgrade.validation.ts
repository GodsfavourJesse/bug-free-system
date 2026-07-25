import {
    PaymentMethod,
    UpgradeRequestStatus,
} from "@/database/enums/upgrade.enum";
import { DuplicatePendingUpgradeRequestError, HighestMembershipPlanError, InvalidPaymentMethodError, InvalidUpgradeRequestStatusError, MembershipPlanNotFoundError, UnauthorizedUpgradeRequestError, UpgradeRequestNotFoundError } from "./upgrade.errors";


export class UpgradeValidation {

    // Ensure the membership plan exists.
    ensureMembershipPlanExists<T>(
        membershipPlan: T | null,
    ) {
        if (!membershipPlan) {
            throw new MembershipPlanNotFoundError();
        }

        return membershipPlan;
    }

    // Ensure the requested upgrade request exists.
    ensureUpgradeRequestExists<T>(
        request: T | null,
    ) {
        if (!request) {
            throw new UpgradeRequestNotFoundError();
        }

        return request;
    }

    // Ensure the payment method is valid.
    validatePaymentMethod(
        paymentMethod: PaymentMethod,
    ) {
        if (
            !Object.values(PaymentMethod).includes(
                paymentMethod,
            )
        ) {
            throw new InvalidPaymentMethodError();
        }

        return paymentMethod;
    }

    // Ensure the request status is valid.
    validateStatus(
        status: UpgradeRequestStatus,
    ) {
        if (
            !Object.values(
                UpgradeRequestStatus,
            ).includes(status)
        ) {
            throw new InvalidUpgradeRequestStatusError();
        }

        return status;
    }

    // Ensure the user owns this request.
    ensureRequestBelongsToUser(
        requestUserId: string,
        authenticatedUserId: string,
    ) {
        if (
            requestUserId !==
            authenticatedUserId
        ) {
            throw new UnauthorizedUpgradeRequestError();
        }
    }

    // Ensure there is no existing pending request.
    ensureNoPendingRequest(
        pendingRequest: unknown,
    ) {
        if (pendingRequest) {
            throw new DuplicatePendingUpgradeRequestError();
        }
    }

    // Ensure the user is not already on the highest plan.
    ensureNotHighestMembership(
        currentSortOrder: number,
        requestedSortOrder: number,
    ) {
        if (
            requestedSortOrder <=
            currentSortOrder
        ) {
            throw new HighestMembershipPlanError();
        }
    }
}

export const upgradeValidation =
    new UpgradeValidation();