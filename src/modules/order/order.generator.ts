import {
    CreateDailyOrderDto,
    CreateOrderItemDto,
} from "./order.dto";

import { orderRepository } from "./order.repository";

import { membershipPlanService } from "../membership-plan/membershipPlan.service";
import { dailyOrderConfigRepository } from "../admin/daily-order-config/dailyOrderConfig.repository";
import { userRepository } from "../user/user.repository";

import { advertisementRepository } from "../admin/advertisement/advertisement.repository";
import { completedAdvertisementRepository } from "../completed-advertisement/completedAdvertisement.repository";

import { DbExecutor } from "../../database/types/types";

export class OrderGenerator {

    // Generates today's daily tasks.
    // Rules:
    // - User receives ACTIVE advertisements only.
    // - Previously completed advertisements are excluded.
    // - If fewer advertisements are available than configured, generate only the remaining ones.
    // - If none remain, create an empty order instead of throwing.
    async generate(
        executor: DbExecutor,
        userId: string,
    ) {

        // Find user
        const user = await userRepository.findById(
            executor,
            userId,
        );

        if (!user) {
            throw new Error(
                "User not found.",
            );
        }

        if (!user.membershipPlanId) {
            throw new Error(
                "User has no membership plan.",
            );
        }

        // Membership
        const membership = await membershipPlanService.getPlan(
            user.membershipPlanId,
        );

        // Daily configuration
        const config = await dailyOrderConfigRepository.findByMembershipPlanId(
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

        // Prevent duplicate generation.
        const existing = await orderRepository.findTodayOrder(
            executor,
            userId,
            today,
        );

        if (existing) {
            return {
                order: existing,
                items: await orderRepository.findItems(
                    executor,
                    existing.id,
                ),
            };
        }

        // Previously completed advertisements.
        const completedAdvertisementIds = await completedAdvertisementRepository.findCompletedAdvertisementIds(
            executor,
            userId,
        );

        // Generate a deterministic random seed.
        // Same user gets the same advertisements for one day.
        // Different users receive different ads.
        const randomSeed = `${userId}-${today}`;

        const advertisements = await advertisementRepository.findActiveExcluding(
            executor,
            completedAdvertisementIds,
            config.tasksPerDay,
            randomSeed,
        );
        

        console.log({
            requestedTasks: config.tasksPerDay,
            availableAdvertisements: advertisements.length,
            completedAdvertisementIds,
            advertisementIds: advertisements.map(
                (a) => a.id,
            ),
        });

        // Generate only as many tasks as are actually available.
        const taskCount = advertisements.length;

        // Calculate reward.
        const totalReward = (
            Number(config.rewardPerTask) *
            taskCount
        ).toFixed(2);

        // Create today's order.
        const orderDto: CreateDailyOrderDto = {
            userId,
            membershipPlanId: membership.id,
            configId: config.id,
            date: today,
            requiredTasks: taskCount,
            totalReward,
        };

        const order = await orderRepository.createDailyOrder(
            executor,
            orderDto,
        );

        // No advertisements remaining.
        // Return an empty order instead of throwing an exception.
        if (taskCount === 0) {
            return {
                order,
                items: [],
            };
        }

        // Create order items.
        const items: CreateOrderItemDto[] = advertisements.map(
            (
                advertisement,
                index,
            ) => ({
                dailyOrderId: order.id,
                sequence: index + 1,
                reward: config.rewardPerTask,
                advertisementId: advertisement.id,
            }),
        );

        const createdItems = await orderRepository.createOrderItems(
            executor,
            items,
        );

        console.log("Items to insert:");
        console.dir(items, { depth: null });
            

        return {
            order,
            items: createdItems,
        };
    }
}

export const orderGenerator = new OrderGenerator();