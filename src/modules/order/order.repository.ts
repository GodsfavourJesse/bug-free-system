import { and, asc, eq, inArray, lt } from "drizzle-orm";
import { CreateDailyOrderDto, CreateOrderItemDto } from "./order.dto";
import { DbExecutor } from "../../database/types/types";
import { advertisements, dailyOrderItems, dailyOrders } from "../../database/schema";
import { DailyOrderItemStatus, DailyOrderStatus } from "../../database/enums/daily_order.enum";


export class OrderRepository {

    // Create a daily order.
    async createDailyOrder(
        executor: DbExecutor,
        dto: CreateDailyOrderDto,
    ) {
        const [order] = await executor
            .insert(dailyOrders)
            .values({
                userId: dto.userId,
                membershipPlanId: dto.membershipPlanId,
                configId: dto.configId,
                date: dto.date,
                requiredTasks: dto.requiredTasks,
                totalReward: dto.totalReward,
            })
            .returning();

        return order;
    }

    // Create every task belonging to a daily order.
    async createOrderItems(
        executor: DbExecutor,
        items: CreateOrderItemDto[],
    ) {
        return executor
            .insert(dailyOrderItems)
            .values(
                items.map(
                    (item) => ({
                        dailyOrderId: item.dailyOrderId,
                        sequence: item.sequence,
                        reward: item.reward,
                        advertisementId: item.advertisementId,
                    }),
                ),
            )
            .returning();
    }

    // Find today's order for a user.
    async findTodayOrder(
        executor: DbExecutor,
        userId: string,
        date: string,
    ) {
        const [order] = await executor
            .select()
            .from(dailyOrders)
            .where(
                and(
                    eq(
                        dailyOrders.userId,
                        userId,
                    ),
                    eq(
                        dailyOrders.date,
                        date,
                    ),
                ),
            )
            .limit(1);

        return order ?? null;
    }

    // Find one order by its ID.
    async findOrderById(
        executor: DbExecutor,
        orderId: string,
    ) {
        const [order] = await executor
            .select()
            .from(dailyOrders)
            .where(
                eq(
                    dailyOrders.id,
                    orderId,
                ),
            )
            .limit(1);

        return order ?? null;
    }

    // Find all items belonging to an order.
    async findItems(
        executor: DbExecutor,
        dailyOrderId: string,
    ) {
        return executor
            .select()
            .from(dailyOrderItems)
            .where(
                eq(
                    dailyOrderItems.dailyOrderId,
                    dailyOrderId,
                ),
            );
    }

    // Find one task.
    async findItemById(
        executor: DbExecutor,
        itemId: string,
    ) {
        const [item] =
            await executor
                .select({
                    id: dailyOrderItems.id,
                    dailyOrderId: dailyOrderItems.dailyOrderId,
                    sequence: dailyOrderItems.sequence,
                    reward: dailyOrderItems.reward,
                    status: dailyOrderItems.status,
                    completedAt: dailyOrderItems.completedAt,
                    
                    advertisement: {
                        id: advertisements.id,
                        title: advertisements.title,
                        thumbnailUrl: advertisements.thumbnailUrl,
                        bannerUrl: advertisements.bannerUrl,
                        shortDescription: advertisements.shortDescription,
                        fullDescription: advertisements.fullDescription,
                        buttonText: advertisements.buttonText,
                    },
                })
                .from(
                    dailyOrderItems,
                )
                .leftJoin(
                    advertisements,
                    eq(
                        dailyOrderItems.advertisementId,
                        advertisements.id,
                    ),
                )
                .where(
                    eq(
                        dailyOrderItems.id,
                        itemId,
                    ),
                )
                .limit(1);

        return item ?? null;
    }

    // Lock the parent daily order. Used when completing tasks.
    async lockOrder(
        executor: DbExecutor,
        orderId: string,
    ) {
        const [order] = await executor
            .select()
            .from(
                dailyOrders,
            )
            .where(
                eq(
                    dailyOrders.id,
                    orderId,
                ),
            )
            .limit(1)
            .for("update");

        return order ?? null;
    }

    // Lock one task. Used before marking it completed.
    async lockItem(
        executor: DbExecutor,
        itemId: string,
    ) {
        const [item] = await executor
            .select({
                id: dailyOrderItems.id,
                dailyOrderId: dailyOrderItems.dailyOrderId,
                advertisementId: dailyOrderItems.advertisementId,
                reward: dailyOrderItems.reward,
                status: dailyOrderItems.status,
                completedAt: dailyOrderItems.completedAt,
            })
            .from(
                dailyOrderItems,
            )
            .where(
                eq(
                    dailyOrderItems.id,
                    itemId,
                ),
            )
            .limit(1)
            .for("update");

        return item ?? null;
    }

    // Update the number of completed tasks.
    async updateOrderProgress(
        executor: DbExecutor,
        orderId: string,
        completedTasks: number,
        status: DailyOrderStatus,
        rewardEarned: number,
    ) {
        const [order] = await executor
            .update(dailyOrders)
            .set({
                completedTasks,
                status,
                rewardEarned: rewardEarned.toFixed(2),
            })
            .where(
                eq(
                    dailyOrders.id,
                    orderId,
                ),
            )
            .returning();

        return order;
    }

    // Mark one task as completed.
    async completeItem(
        executor: DbExecutor,
        itemId: string,
    ) {
        const [item] = await executor
            .update(dailyOrderItems)
            .set({
                status: DailyOrderItemStatus.COMPLETED,
                completedAt: new Date(),
            })
            .where(
                eq(
                    dailyOrderItems.id,
                    itemId,
                ),
            )
            .returning();

        return item;
    }

    // Mark the entire daily order as completed.
    async completeOrder(
        executor: DbExecutor,
        orderId: string,
        rewardEarned: string,
    ) {
        const [order] = await executor
            .update(dailyOrders)
            .set({
                status: DailyOrderStatus.COMPLETED,
                rewardEarned,
                completedAt: new Date(),
            })
            .where(
                eq(
                    dailyOrders.id,
                    orderId,
                ),
            )
            .returning();

        return order;
    }

    // Expire every unfinished daily order created before the specified date.
    async expireOrders(
        executor: DbExecutor,
        date: string,
    ) {
        return executor
            .update(dailyOrders)
            .set({
                status: DailyOrderStatus.EXPIRED,
            })
            .where(
                and(
                    lt(
                        dailyOrders.date,
                        date,
                    ),
                    inArray(
                        dailyOrders.status,
                        [
                            DailyOrderStatus.PENDING,
                            DailyOrderStatus.IN_PROGRESS,
                        ],
                    ),
                ),
            )
            .returning();
    }

    async findIncompleteOrders(
        executor: DbExecutor,
    ) {
        return executor
            .select()
            .from(dailyOrders)
            .where(
                and(
                    eq(
                        dailyOrders.status,
                        DailyOrderStatus.PENDING,
                    ),
                ),
            );
    }

    // Find today's order together with all its tasks.
    async findTodayOrderWithItems(
        executor: DbExecutor,
        userId: string,
        date: string,
    ) {
        const rows = await executor
            .select({
                order: dailyOrders,

                itemId: dailyOrderItems.id,
                itemDailyOrderId: dailyOrderItems.dailyOrderId,
                itemAdvertisementId: dailyOrderItems.advertisementId,
                itemSequence: dailyOrderItems.sequence,
                itemReward: dailyOrderItems.reward,
                itemStatus: dailyOrderItems.status,
                itemCompletedAt: dailyOrderItems.completedAt,
                itemCreatedAt: dailyOrderItems.createdAt,

                advertisementId: advertisements.id,
                advertisementTitle: advertisements.title,
                advertisementThumbnailUrl: advertisements.thumbnailUrl,
                advertisementBannerUrl: advertisements.bannerUrl,
                advertisementShortDescription: advertisements.shortDescription,
                advertisementFullDescription: advertisements.fullDescription,
                advertisementButtonText: advertisements.buttonText,
            })
            .from(dailyOrders)
            .leftJoin(
                dailyOrderItems,
                eq(
                    dailyOrders.id,
                    dailyOrderItems.dailyOrderId,
                ),
            )
            .leftJoin(
                advertisements,
                eq(
                    dailyOrderItems.advertisementId,
                    advertisements.id,
                ),
            )
            .where(
                and(
                    eq(
                        dailyOrders.userId,
                        userId,
                    ),
                    eq(
                        dailyOrders.date,
                        date,
                    ),
                ),
            )
            .orderBy(
                asc(
                    dailyOrderItems.sequence,
                ),
            );

        if (!rows.length) {
            return null;
        }

        const order = rows[0].order;

        const items = rows
            .filter((row) => row.itemId !== null)
            .map((row) => ({
                id: row.itemId!,
                dailyOrderId: row.itemDailyOrderId!,
                advertisementId: row.itemAdvertisementId,
                sequence: row.itemSequence!,
                reward: row.itemReward!,
                status: row.itemStatus!,
                completedAt: row.itemCompletedAt,
                createdAt: row.itemCreatedAt!,

                advertisement: row.advertisementId
                    ? {
                        id: row.advertisementId,
                        title: row.advertisementTitle!,
                        thumbnailUrl: row.advertisementThumbnailUrl,
                        bannerUrl: row.advertisementBannerUrl,
                        shortDescription: row.advertisementShortDescription,
                        fullDescription: row.advertisementFullDescription!,
                        buttonText: row.advertisementButtonText!,
                    }
                    : null,
            }));

        return {
            ...order,
            items,
        };
    }

    // Find today's order together with only pending tasks.
    async findTodayOrderWithPendingItems(
        executor: DbExecutor,
        userId: string,
        date: string,
    ) {
        const rows = await executor
            .select({
                order: dailyOrders,

                itemId: dailyOrderItems.id,
                itemDailyOrderId: dailyOrderItems.dailyOrderId,
                itemAdvertisementId: dailyOrderItems.advertisementId,
                itemSequence: dailyOrderItems.sequence,
                itemReward: dailyOrderItems.reward,
                itemStatus: dailyOrderItems.status,
                itemCompletedAt: dailyOrderItems.completedAt,
                itemCreatedAt: dailyOrderItems.createdAt,

                advertisementId: advertisements.id,
                advertisementTitle: advertisements.title,
                advertisementThumbnailUrl: advertisements.thumbnailUrl,
                advertisementBannerUrl: advertisements.bannerUrl,
                advertisementShortDescription: advertisements.shortDescription,
                advertisementFullDescription: advertisements.fullDescription,
                advertisementButtonText: advertisements.buttonText,
            })
            .from(dailyOrders)
            .leftJoin(
                dailyOrderItems,
                and(
                    eq(
                        dailyOrders.id,
                        dailyOrderItems.dailyOrderId,
                    ),
                    eq(
                        dailyOrderItems.status,
                        DailyOrderItemStatus.PENDING,
                    ),
                ),
            )
            .leftJoin(
                advertisements,
                eq(
                    dailyOrderItems.advertisementId,
                    advertisements.id,
                ),
            )
            .where(
                and(
                    eq(
                        dailyOrders.userId,
                        userId,
                    ),
                    eq(
                        dailyOrders.date,
                        date,
                    ),
                ),
            )
            .orderBy(
                asc(
                    dailyOrderItems.sequence,
                ),
            );

        if (!rows.length) {
            return null;
        }

        const order = rows[0].order;

        const items = rows
            .filter(
            (row) => row.itemId !== null,
            )
            .map((row) => ({
                id: row.itemId!,
                dailyOrderId: row.itemDailyOrderId!,
                advertisementId: row.itemAdvertisementId,
                sequence: row.itemSequence!,
                reward: row.itemReward!,
                status: row.itemStatus!,
                completedAt: row.itemCompletedAt,
                createdAt: row.itemCreatedAt!,

                advertisement: row.advertisementId
                    ? {
                        id: row.advertisementId,
                        title: row.advertisementTitle!,
                        thumbnailUrl: row.advertisementThumbnailUrl,
                        bannerUrl: row.advertisementBannerUrl,
                        shortDescription: row.advertisementShortDescription,
                        fullDescription: row.advertisementFullDescription!,
                        buttonText: row.advertisementButtonText!,
                    }
                    : null,
            }));

        return {
            ...order,
            items,
        };
    }

}

export const orderRepository = new OrderRepository();