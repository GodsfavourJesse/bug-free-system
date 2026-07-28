export class DailyOrderConfigValidation {

    /**
     * Ensure a configuration exists.
     */
    ensureExists<
        T extends {
            id: string;
        },
    >(
        config: T | null,
    ): T {
        if (!config) {
            throw new Error(
                "Daily order configuration not found.",
            );
        }

        return config;
    }

    /**
     * Ensure configuration is active.
     */
    ensureActive<
        T extends {
            isActive: boolean;
        },
    >(
        config: T,
    ): T {
        if (!config.isActive) {
            throw new Error(
                "Daily order configuration is inactive.",
            );
        }

        return config;
    }

    /**
     * Ensure configuration is inactive.
     */
    ensureInactive<
        T extends {
            isActive: boolean;
        },
    >(
        config: T,
    ): T {
        if (config.isActive) {
            throw new Error(
                "Daily order configuration is already active.",
            );
        }

        return config;
    }

    /**
     * Ensure at least one task
     * is configured.
     */
    ensureTasksConfigured<
        T extends {
            tasksPerDay: number;
        },
    >(
        config: T,
    ): T {
        if (config.tasksPerDay <= 0) {
            throw new Error(
                "Daily order configuration has no tasks.",
            );
        }

        return config;
    }

    /**
     * Ensure reward per task
     * is valid.
     */
    ensureRewardConfigured<
        T extends {
            rewardPerTask: string;
        },
    >(
        config: T,
    ): T {
        if (
            Number(config.rewardPerTask) <= 0
        ) {
            throw new Error(
                "Reward per task must be greater than zero.",
            );
        }

        return config;
    }

    /**
     * Ensure daily reward limit
     * is valid.
     */
    ensureDailyRewardLimit<
        T extends {
            dailyRewardLimit: string;
        },
    >(
        config: T,
    ): T {
        if (
            Number(config.dailyRewardLimit) <= 0
        ) {
            throw new Error(
                "Daily reward limit must be greater than zero.",
            );
        }

        return config;
    }

    /**
     * Ensure the configuration
     * is completely usable for
     * generating daily orders.
     */
    ensureUsable<
        T extends {
            isActive: boolean;
            tasksPerDay: number;
            rewardPerTask: string;
            dailyRewardLimit: string;
        },
    >(
        config: T,
    ): T {
        this.ensureActive(config);
        this.ensureTasksConfigured(config);
        this.ensureRewardConfigured(config);
        this.ensureDailyRewardLimit(config);

        return config;
    }
}

export const dailyOrderConfigValidation =
    new DailyOrderConfigValidation();