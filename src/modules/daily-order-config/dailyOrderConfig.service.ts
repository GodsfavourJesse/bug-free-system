import { db } from "../../database";
import { withTransaction } from "../../database/transaction/transaction";

import { membershipPlanService } from "../membership-plan/membershipPlan.service";

import { dailyOrderConfigRepository } from "./dailyOrderConfig.repository";

import { dailyOrderConfigs } from "../../database/schema";
import { dailyOrderConfigValidation } from "./dailyOrderConfig.validation";

export class DailyOrderConfigService {

    /**
     * Return every configuration.
     */
    async findAll() {
        return dailyOrderConfigRepository.findAll(db);
    }

    /**
     * Return one configuration.
     */
    async findById(
        id: string,
    ) {
        const config =
            await dailyOrderConfigRepository.findById(
                db,
                id,
            );

        return dailyOrderConfigValidation.ensureExists(
            config,
        );
    }

    /**
     * Create a configuration.
     *
     * Only one active configuration
     * should exist per membership plan.
     */
    async create(
        data: typeof dailyOrderConfigs.$inferInsert,
    ) {
        return withTransaction(
            async (tx) => {

                // Ensure membership exists.
                await membershipPlanService.getPlan(
                    data.membershipPlanId,
                );

                if (data.isActive) {

                    const existing =
                        await dailyOrderConfigRepository.findByMembershipPlanId(
                            tx,
                            data.membershipPlanId,
                        );

                    if (existing) {
                        await dailyOrderConfigRepository.updateStatus(
                            tx,
                            existing.id,
                            false,
                        );
                    }
                }

                const config =
                    await dailyOrderConfigRepository.create(
                        tx,
                        data,
                    );

                return config;
            },
        );
    }

    /**
     * Update a configuration.
     */
    async update(
        id: string,
        data: Partial<
            typeof dailyOrderConfigs.$inferInsert
        >,
    ) {
        return withTransaction(
            async (tx) => {

                const existing =
                    await dailyOrderConfigRepository.findById(
                        tx,
                        id,
                    );

                dailyOrderConfigValidation.ensureExists(
                    existing,
                );

                if (
                    data.membershipPlanId
                ) {
                    await membershipPlanService.getPlan(
                        data.membershipPlanId,
                    );
                }

                const config =
                    await dailyOrderConfigRepository.update(
                        tx,
                        id,
                        data,
                    );

                return dailyOrderConfigValidation.ensureExists(
                    config,
                );
            },
        );
    }

    /**
     * Delete a configuration.
     */
    async delete(
        id: string,
    ) {
        return withTransaction(
            async (tx) => {

                const existing =
                    await dailyOrderConfigRepository.findById(
                        tx,
                        id,
                    );

                dailyOrderConfigValidation.ensureExists(
                    existing,
                );

                return dailyOrderConfigRepository.delete(
                    tx,
                    id,
                );
            },
        );
    }

    /**
     * Activate a configuration.
     *
     * Only one configuration may
     * be active for a membership.
     */
    async activate(
        id: string,
    ) {
        return withTransaction(
            async (tx) => {

                const config =
                    await dailyOrderConfigRepository.findById(
                        tx,
                        id,
                    );

                dailyOrderConfigValidation.ensureExists(
                    config,
                );

                const active =
                    await dailyOrderConfigRepository.findByMembershipPlanId(
                        tx,
                        config.membershipPlanId,
                    );

                if (
                    active &&
                    active.id !== config.id
                ) {
                    await dailyOrderConfigRepository.updateStatus(
                        tx,
                        active.id,
                        false,
                    );
                }

                return dailyOrderConfigRepository.updateStatus(
                    tx,
                    config.id,
                    true,
                );
            },
        );
    }

    /**
     * Deactivate a configuration.
     */
    async deactivate(
        id: string,
    ) {
        return withTransaction(
            async (tx) => {

                const config =
                    await dailyOrderConfigRepository.findById(
                        tx,
                        id,
                    );

                dailyOrderConfigValidation.ensureExists(
                    config,
                );

                return dailyOrderConfigRepository.updateStatus(
                    tx,
                    id,
                    false,
                );
            },
        );
    }
}

export const dailyOrderConfigService =
    new DailyOrderConfigService();