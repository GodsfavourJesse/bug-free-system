import { orderRepository } from "./order.repository";
import { orderGenerator } from "./order.generator";
import { orderValidation } from "./order.validation";
import {
    CompleteOrderItemDto,
    GenerateDailyOrdersDto,
} from "./order.dto";

import { db } from "../../database";
import { withTransaction } from "../../database/transaction/transaction";

import { DailyOrderStatus } from "../../database/enums/daily_order.enum";
import {
    TransactionType,
} from "../../database/enums/transaction.enum";
import {
    NotificationType,
} from "../../database/enums/notification.enum";

import { rewardEngineService } from "../reward-engine/rewardEngine.service";
import { completedAdvertisementService } from "../completed-advertisement/completedAdvertisement.service";
import { TodayOrderState } from "../../database/enums/today-order.enum";

export class OrderService {

    // Returns one daily task group.
    async getOrderById(
        orderId: string,
    ) {
        const order =
            await orderRepository.findOrderById(
                db,
                orderId,
            );

        return orderValidation.ensureOrderExists(
            order,
        );
    }

    // Generate today's tasks.
    async generateDailyOrders(
        dto: GenerateDailyOrdersDto,
    ) {
        return withTransaction(
            async (tx) => {
                const today =
                    new Date()
                        .toISOString()
                        .split("T")[0];

                const existingOrder = await orderRepository.findTodayOrderWithItems(
                    tx,
                    dto.userId,
                    today,
                );

                if (existingOrder) {
                    return existingOrder;
                }

                return orderGenerator.generate(
                    tx,
                    dto.userId,
                );
            },
        );
    }

    // Get today's task group.
    async getTodayOrder(
        userId: string,
    ) {
        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        // Fetch today's order together with ALL tasks, not only pending tasks.
        let order = await orderRepository.findTodayOrderWithPendingItems(
            db,
            userId,
            today,
        );

        // Generate today's order if one doesn't exist.
        if (!order) {
            await this.generateDailyOrders({
                userId,
            });

            order = await orderRepository.findTodayOrderWithPendingItems(
                db,
                userId,
                today,
            );
        }

        order = orderValidation.ensureOrderExists(
            order,
        );

        // Determine today's state.
        let state: TodayOrderState;

        if (order.requiredTasks === 0) {
            state = TodayOrderState.NO_TASKS;
        } else if (
            order.completedTasks >=
            order.requiredTasks
        ) {
            state = TodayOrderState.COMPLETED;
        } else {
            state = TodayOrderState.AVAILABLE;
        }

        return {
            ...order,
            state,
        };
    }


    // Get every task belonging to today's order.
    async getOrderItems(
        userId: string,
    ) {
        const order =
            await this.getTodayOrder(
                userId,
            );

        return order.items;
    }

    // Complete one task.
    async completeOrderItem(
        dto: CompleteOrderItemDto,
    ) {
        const {
            userId,
            itemId,
        } = dto;

        return withTransaction(
            async (tx) => {

                // Lock task.
                const item =
                    await orderRepository.lockItem(
                        tx,
                        itemId,
                    );

                orderValidation.ensureItemExists(
                    item,
                );

                orderValidation.ensureItemPending(
                    item,
                );

                // Lock parent order.
                const order =
                    await orderRepository.lockOrder(
                        tx,
                        item.dailyOrderId,
                    );

                orderValidation.ensureOrderExists(
                    order,
                );

                orderValidation.ensureOrderIncomplete(
                    order,
                );

                /**
                 * Complete the task.
                 */
                await orderRepository.completeItem(
                    tx,
                    item.id,
                );

                /**
                 * Permanently record that this user
                 * has completed this advertisement.
                 *
                 * This prevents the advertisement from
                 * ever being generated again for this user.
                 */
                if (!item.advertisementId) {
                    throw new Error(
                        "Task has no advertisement attached.",
                    );
                }

                await completedAdvertisementService.complete(
                    tx,
                    {
                        userId,
                        advertisementId: item.advertisementId,
                    },
                );

                await rewardEngineService.creditReward(
                    tx,
                    {
                        userId,
                        amount: Number(item.reward),
                        type: TransactionType.ORDER_REWARD,
                        description: "Daily task reward.",

                        notification: {
                            title: "Task Completed",
                            message: `You've earned ₦${item.reward} for completing a task.`,
                            type: NotificationType.ORDER_REWARD,
                        },

                        metadata: {
                            source: "daily_order",
                            dailyOrderId: order.id,
                            dailyOrderItemId: item.id,
                            advertisementId: item.advertisementId,
                        },
                    },
                );

                const completedTasks =
                    order.completedTasks + 1;

                const status =
                    completedTasks >=
                    order.requiredTasks
                        ? DailyOrderStatus.COMPLETED
                        : DailyOrderStatus.IN_PROGRESS;

                const rewardEarned =
                    Number(order.rewardEarned) + Number(item.reward)

                /**
                 * Update order progress.
                 */
                await orderRepository.updateOrderProgress(
                    tx,
                    order.id,
                    completedTasks,
                    status,
                    rewardEarned,
                );

                /**
                 * Finish the daily order when every
                 * task has been completed.
                 */
                if (
                    completedTasks >=
                    order.requiredTasks
                ) {
                    await this.completeDailyOrder(
                        tx,
                        order.id,
                    );
                }

                return {
                    success: true,
                };
            },
        );
    }

    // Finish an entire day's tasks.
    async completeDailyOrder(
        tx: Parameters<
            typeof withTransaction
        >[0] extends (
            executor: infer T,
        ) => Promise<any>
            ? T
            : never,
        orderId: string,
    ) {

        const order = await orderRepository.findOrderById(
            tx,
            orderId,
        );

        orderValidation.ensureOrderExists(
            order,
        );

        // Mark the order as completed.
        await orderRepository.completeOrder(
            tx,
            order.id,
            order.totalReward,
        );
    }

    // Expire every unfinished daily
    // task group before today.
    async expireOrders() {

        return withTransaction(
            async (tx) => {

                const today =
                    new Date()
                        .toISOString()
                        .split("T")[0];

                return orderRepository.expireOrders(
                    tx,
                    today,
                );
            },
        );
    }

    // Get one order item.
    async getOrderItem(
        itemId: string,
    ) {
        const item = await orderRepository.findItemById(
            db,
            itemId,
        );

        return orderValidation.ensureItemExists(
            item,
        );
    }    
}

export const orderService = new OrderService();