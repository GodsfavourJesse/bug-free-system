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

                const existingOrder =
                    await orderRepository.findTodayOrder(
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

        const order =
            await orderRepository.findTodayOrder(
                db,
                userId,
                today,
            );

        return orderValidation.ensureOrderExists(
            order,
        );
    }

    // Get every task belonging to today's order.
    async getOrderItems(
        userId: string,
    ) {
        const order =
            await this.getTodayOrder(
                userId,
            );

        return orderRepository.findItems(
            db,
            order.id,
        );
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

                // Complete task.
                await orderRepository.completeItem(
                    tx,
                    item.id,
                );

                const completedTasks =
                    order.completedTasks + 1;

                const status =
                    completedTasks >=
                    order.requiredTasks
                        ? DailyOrderStatus.COMPLETED
                        : DailyOrderStatus.IN_PROGRESS;

                // Update progress.
                await orderRepository.updateOrderProgress(
                    tx,
                    order.id,
                    completedTasks,
                    status,
                );

                // Finish daily order when all tasks are done.
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

        const order =
            await orderRepository.findOrderById(
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

        // Delegate all reward processing
        // to the Reward Engine.
        await rewardEngineService.creditReward(
            tx,
            {
                userId:
                    order.userId,

                amount:
                    Number(
                        order.totalReward,
                    ),

                type:
                    TransactionType.ORDER_REWARD,

                description:
                    "Daily task reward.",

                notification: {
                    title:
                        "Daily Tasks Completed",

                    message: `You've successfully completed today's daily tasks and earned ₦${order.totalReward}.`,

                    type:
                        NotificationType.ORDER_REWARD,
                },

                metadata: {
                    source:
                        "daily_order",

                    dailyOrderId:
                        order.id,
                },
            },
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
}

export const orderService =
    new OrderService();