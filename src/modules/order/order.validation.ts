import { DailyOrderItemStatus, DailyOrderStatus } from "@/database/enums/daily_order.enum";
import {
    UserNotEligibleForDailyOrdersError,
    MembershipNotEligibleForDailyOrdersError,
    DailyOrderNotFoundError,
    DailyOrderItemNotFoundError,
    DailyOrderItemAlreadyCompletedError,
    DailyOrderAlreadyCompletedError,
} from "./order.errors";

export class OrderValidation {

    // Ensure the user is eligible to receive daily orders.
    ensureEligibleUser(
        user: {
            isActive: boolean;
            membershipPlanId: string | null;
        },
    ) {
        if (
            !user.isActive ||
            !user.membershipPlanId
        ) {
            throw new UserNotEligibleForDailyOrdersError();
        }

        return user;
    }

    // Ensure the user's membership can receive daily orders.
    ensureMembershipActive(
        membership: {
            isActive: boolean;
        } | null,
    ) {
        if (
            !membership ||
            !membership.isActive
        ) {
            throw new MembershipNotEligibleForDailyOrdersError();
        }

        return membership;
    }

    // Ensure the daily order exists.
    ensureOrderExists<T>(
        order: T | null,
    ): T {
        if (!order) {
            throw new DailyOrderNotFoundError();
        }

        return order;
    }

    // Ensure the order item exists.
    ensureItemExists<T>(
        item: T | null,
    ): T {
        if (!item) {
            throw new DailyOrderItemNotFoundError();
        }

        return item;
    }

    // Ensure the item has not already been completed.
    ensureItemPending(
    item: {
        status: "pending" | "completed" | "expired";
    },
    ) {
        if (
            item.status !== "pending"
        ) {
            throw new Error(
                "Task has already been completed.",
            );
        }
    }

    // Ensure the parent order is still active.
    ensureOrderIncomplete(
        order: {
            status:
                | "pending"
                | "in_progress"
                | "completed"
                | "expired";
        },
    ) {
        if (
            order.status === "completed"
        ) {
            throw new Error(
                "Daily task has already been completed.",
            );
        }

        if (
            order.status === "expired"
        ) {
            throw new Error(
                "Daily task has expired.",
            );
        }
    }
}

export const orderValidation =
    new OrderValidation();