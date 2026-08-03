import { TodayOrderState } from "../../database/enums/today-order.enum";

export interface CreateDailyOrderDto {
    userId: string;
    membershipPlanId: string;
    configId: string;
    date: string;
    requiredTasks: number;
    totalReward: string;
}

export interface CreateOrderItemDto {
    dailyOrderId: string;
    sequence: number;
    reward: string;
    advertisementId: string;
}

export interface CompleteOrderItemDto {
    itemId: string;
    userId: string;
}

export interface GenerateDailyOrdersDto {
    userId: string;
}

/**
 * Advertisement attached to an order item.
 */
export interface TodayOrderAdvertisementDto {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    bannerUrl: string | null;
    shortDescription: string | null;
    fullDescription: string;
    buttonText: string | null;
}

/**
 * One task inside today's order.
 */
export interface TodayOrderItemDto {
    id: string;
    dailyOrderId: string;
    advertisementId: string | null;
    sequence: number;
    reward: string;
    status: string;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;

    advertisement: TodayOrderAdvertisementDto | null;
}

/**
 * Today's order returned to the client.
 */
export interface TodayOrderDto {
    id: string;
    userId: string;
    membershipPlanId: string;
    configId: string;

    date: string;

    status: string;

    state: TodayOrderState;

    requiredTasks: number;
    completedTasks: number;

    totalReward: string;
    rewardEarned: string;

    completedAt: Date | null;

    createdAt: Date;
    updatedAt: Date;

    items: TodayOrderItemDto[];
}