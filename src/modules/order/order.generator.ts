import { CreateDailyOrderDto, CreateOrderItemDto } from "./order.dto";
import { orderRepository } from "./order.repository";
import { membershipPlanService } from "../membership-plan/membershipPlan.service";
import { dailyOrderConfigRepository } from "../admin/daily-order-config/dailyOrderConfig.repository";
import { userRepository } from "../user/user.repository";
import { DbExecutor } from "../../database/types/types";

export class OrderGenerator {

    /**
     * Generates today's daily tasks for one user.
     *
     * Responsibilities:
     * - determine membership
     * - determine configuration
     * - calculate rewards
     * - create daily order
     * - generate task items
     */
    async generate(
        executor: DbExecutor,
        userId: string,
    ) {

        // Find user
        const user =
            await userRepository.findById(
                executor,
                userId,
            );

        if (!user.membershipPlanId) {
            throw new Error(
                "User has no membership plan.",
            );
        }

        // Membership
        const membership =
            await membershipPlanService.getPlan(
                user.membershipPlanId,
            );

        // Configuration
        const config =
            await dailyOrderConfigRepository.findByMembershipPlanId(
                executor,
                membership.id,
            );

        if (!config) {
            throw new Error(
                "Daily order configuration not found.",
            );
        }

        // Today's date
        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        // Prevent duplicates
        const existing =
            await orderRepository.findTodayOrder(
                executor,
                userId,
                today,
            );

        if (existing) {
            return {
                order: existing,
                items:
                    await orderRepository.findItems(
                        executor,
                        existing.id,
                    ),
            };
        }

        // Calculate totals
        const totalReward =
            (
                Number(
                    config.rewardPerTask,
                ) *
                config.tasksPerDay
            ).toFixed(2);

        // Create parent order
        const orderDto: CreateDailyOrderDto =
            {
                userId,

                membershipPlanId:
                    membership.id,

                configId:
                    config.id,

                date: today,

                requiredTasks:
                    config.tasksPerDay,

                totalReward,
            };

        const order =
            await orderRepository.createDailyOrder(
                executor,
                orderDto,
            );

        // Generate task items
        const items: CreateOrderItemDto[] =
            [];

        for (
            let sequence = 1;
            sequence <=
            config.tasksPerDay;
            sequence++
        ) {

            items.push({
                dailyOrderId:
                    order.id,

                sequence,

                reward:
                    config.rewardPerTask,

                advertisementId:
                    null,
            });
        }

        const createdItems =
            await orderRepository.createOrderItems(
                executor,
                items,
            );

        return {
            order,
            items: createdItems,
        };
    }
}

export const orderGenerator =
    new OrderGenerator();