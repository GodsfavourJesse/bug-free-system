import { and, asc, eq, inArray, lt } from "drizzle-orm";
import { CreateDailyOrderDto, CreateOrderItemDto } from "./order.dto";
import { DbExecutor } from "../../database/types/types";
import { dailyOrderItems, dailyOrders } from "../../database/schema";
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

                membershipPlanId:
                    dto.membershipPlanId,

                configId:
                    dto.configId,

                date:
                    dto.date,

                requiredTasks:
                    dto.requiredTasks,

                totalReward:
                    dto.totalReward,
            })
            .returning();

        return order;
    }

    // Create every task belonging
    // to a daily order.
    async createOrderItems(
        executor: DbExecutor,
        items: CreateOrderItemDto[],
    ) {
        return executor
            .insert(dailyOrderItems)
            .values(
                items.map(
                    (item) => ({
                        dailyOrderId:
                            item.dailyOrderId,

                        sequence:
                            item.sequence,

                        reward:
                            item.reward,

                        advertisementId:
                            item.advertisementId,
                    }),
                ),
            )
            .returning();
    }

    // Find today's order
    // for a user.
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

    // Find one order
    // by its ID.
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

    // Find all items
    // belonging to an order.
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
                .select()
                .from(
                    dailyOrderItems,
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

    // Lock the parent daily order.
    // Used when completing tasks.
    async lockOrder(
        executor: DbExecutor,
        orderId: string,
    ) {
        const [order] =
            await executor
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

    // Lock one task.
    // Used before marking it completed.
    async lockItem(
        executor: DbExecutor,
        itemId: string,
    ) {
        const [item] =
            await executor
                .select()
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
    ) {
        const [order] = await executor
            .update(dailyOrders)
            .set({
                completedTasks,
                status,
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
                status:
                    DailyOrderItemStatus.COMPLETED,

                completedAt:
                    new Date(),
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
                status:
                    DailyOrderStatus.COMPLETED,

                rewardEarned,

                completedAt:
                    new Date(),
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

    // Expire every unfinished daily order
    // created before the specified date.
    async expireOrders(
        executor: DbExecutor,
        date: string,
    ) {
        return executor
            .update(dailyOrders)
            .set({
                status:
                    DailyOrderStatus.EXPIRED,
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
}

export const orderRepository =
    new OrderRepository();