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
    advertisementId?: string;
}

export interface CompleteOrderItemDto {
    itemId: string;
    userId: string;
}

export interface GenerateDailyOrdersDto {
    userId: string;
}