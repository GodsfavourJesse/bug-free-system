import { db } from "@/database";
import { withTransaction } from "@/database/transaction/transaction";

import { DailyOrderStatus } from "@/database/enums/daily_order.enum";

import { orderRepository } from "./order.repository";
import { orderGenerator } from "./order.generator";
import { orderValidation } from "./order.validation";

import { walletService } from "@/modules/wallet/wallet.service";
import { transactionService } from "@/modules/transaction/transaction.service";
import { notificationService } from "@/modules/notification/notification.service";

import { CompleteOrderItemDto, GenerateDailyOrdersDto } from "./order.dto";
import { DbExecutor } from "@/database/types/types";
import { NotificationType } from "@/database/enums/notification.enum";
import { TransactionStatus, TransactionType } from "@/database/enums/transaction.enum";

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

                // Determine new status.
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

                // If every task is completed,
                // finish the daily order.
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

        // Mark order completed.
        await orderRepository.completeOrder(
            tx,
            order.id,
            order.totalReward,
        );

        // Credit reward.
        await this.creditReward(
            tx,
            order.userId,
            Number(order.totalReward),
        );

        // Create transaction.
        await this.createRewardTransaction(
            tx,
            order.userId,
            Number(order.totalReward),
        );

        // Notify user.
        await this.notifyReward(
            tx,
            order.userId,
            order.totalReward,
        );
    }

    // Credit the user's wallet after
    // completing every task.
    async creditReward(
        executor: DbExecutor,
        userId: string,
        amount: number,
    ) {

        await walletService.credit(
            executor,
            userId,
            amount,
        );
    }

    // Create the reward transaction.
    async createRewardTransaction(
        executor: DbExecutor,
        userId: string,
        amount: number,
    ) {

        const wallet =
            await walletService.findByUserId(
                executor,
                userId,
            );

        const balanceAfter =
            Number(
                wallet.availableBalance,
            );

        const balanceBefore =
            balanceAfter - amount;

        await transactionService.createSystemTransaction(
            executor,
            {
                userId,

                walletId:
                    wallet.id,

                amount:
                    amount.toFixed(2),

                balanceBefore:
                    balanceBefore.toFixed(
                        2,
                    ),

                balanceAfter:
                    balanceAfter.toFixed(
                        2,
                    ),

                type:
                    TransactionType.ORDER_REWARD,

                status:
                    TransactionStatus.COMPLETED,

                reference:
                    transactionService.generateReference(),

                description:
                    "Daily task reward.",

                metadata: {
                    source:
                        "daily_order",
                },
            },
        );
    }

    // Notify the user after
    // receiving today's reward.
    async notifyReward(
        executor: DbExecutor,
        userId: string,
        reward: string,
    ) {

        await notificationService.notifyUser(
            executor,
            {
                userId,

                title:
                    "Daily Tasks Completed",

                message: `You've successfully completed today's daily tasks and earned ₦${reward}.`,

                type:
                    NotificationType.ORDER_REWARD,

                metadata: {
                    reward,
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
