import { DbExecutor } from "../../database/types/types";
import { db } from "../../database";

import { advertisementRepository } from "../admin/advertisement/advertisement.repository";
import { advertisements, completedAdvertisements } from "../../database/schema";
import { and, eq, gte, inArray, not, lt } from "drizzle-orm";
import { AdvertisementStatus } from "../../database/enums/advertisement.enum";
import { completedAdvertisementRepository } from "../completed-advertisement/completedAdvertisement.repository";
import { ProductDashboardDto } from "./product.dto";
import { membershipPlanService } from "../membership-plan/membershipPlan.service";
import { dailyOrderConfigService } from "../admin/daily-order-config/dailyOrderConfig.service";
import { completedAdvertisementService } from "../completed-advertisement/completedAdvertisement.service";

export class ProductRepository {

    async getDashboard(
        userId: string,
    ): Promise<ProductDashboardDto> {

        const membership =
            await membershipPlanService.getCurrentPlan(
                userId,
            );

        const rewardPerTask =
            await dailyOrderConfigService.getRewardForMembership(
                membership.id,
            );

        const dailyLimit =
            await dailyOrderConfigService.getDailyLimit(
                membership.id,
            );

        const completedToday =
            await completedAdvertisementService.countCompletedToday(
                userId,
            );

        return {
            rewardPerTask,
            todaysEarnings:
                rewardPerTask * completedToday,
            dailyLimit,
            completedToday,
            remaining:
                Math.max(
                    dailyLimit - completedToday,
                    0,
                ),
        };

    }

    /**
     * Get all products available
     * to the authenticated user.
     *
     * For now this simply returns
     * every active advertisement.
     *
     * Later this will filter by:
     *
     * - Membership
     * - Daily Order Config
     * - Product availability
     */
    async findAvailableProducts(
        executor: DbExecutor = db,
        userId: string,
    ) {
        const completedIds =
            await completedAdvertisementRepository.findCompletedAdvertisementIdsToday(
                executor,
                userId,
            );

        return advertisementRepository.findActiveExcluding(
            executor,
            completedIds,
        );
    }

    /**
     * Get a single product.
     */
    async findProductById(
        executor: DbExecutor = db,
        productId: string,
    ) {
        return advertisementRepository.findById(
            executor,
            productId,
        );
    }

    /**
     * Increment product views.
     */
    async incrementView(
        executor: DbExecutor = db,
        productId: string,
    ) {
        return advertisementRepository.incrementViews(
            executor,
            productId,
        );
    }

    async findCompletedAdvertisementIdsToday(
        executor: DbExecutor = db,
        userId: string,
    ) {
        const startOfToday = new Date();

        startOfToday.setHours(
            0,
            0,
            0,
            0,
        );

        const startOfTomorrow = new Date(
            startOfToday,
        );

        startOfTomorrow.setDate(
            startOfTomorrow.getDate() + 1,
        );

        const rows =
            await executor
                .select({
                    advertisementId:
                        completedAdvertisements.advertisementId,
                })
                .from(completedAdvertisements)
                .where(
                    and(
                        eq(
                            completedAdvertisements.userId,
                            userId,
                        ),
                        gte(
                            completedAdvertisements.completedAt,
                            startOfToday,
                        ),
                        lt(
                            completedAdvertisements.completedAt,
                            startOfTomorrow,
                        ),
                    ),
                );

        return rows.map(
            (row) => row.advertisementId,
        );
    }

    

}

export const productRepository =
    new ProductRepository();