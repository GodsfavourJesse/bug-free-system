import {
    ShareStatus,
} from "../../database/enums/share.enum";

import {
    InvalidShareCycleError,
    InvalidShareDescriptionError,
    InvalidShareLogoError,
    InvalidShareNameError,
    InvalidSharePercentageError,
    InvalidShareStatusError,
} from "./share.errors";


export class ShareValidation {

    /**
     * Validate share name.
     */
    validateName(
        name: string,
    ): string {

        const value = name.trim();

        if (
            value.length < 2 ||
            value.length > 150
        ) {
            throw new InvalidShareNameError();
        }

        return value;
    }

    /**
     * Validate description.
     */
    validateDescription(
        description?: string | null,
    ): string | null {

        if (
            description === undefined ||
            description === null
        ) {
            return null;
        }

        const value =
            description.trim();

        if (
            value.length > 5000
        ) {
            throw new InvalidShareDescriptionError();
        }

        return value || null;
    }

    /**
     * Validate logo.
     */
    // validateLogo(
    //     logo?: string | null,
    // ): string | null {

    //     if (
    //         logo === undefined ||
    //         logo === null
    //     ) {
    //         return null;
    //     }

    //     const value =
    //         logo.trim();

    //     if (!value) {
    //         return null;
    //     }

    //     if (value.length > 500) {
    //         throw new InvalidShareLogoError();
    //     }

    //     try {
    //         new URL(value);
    //     } catch {
    //         throw new InvalidShareLogoError();
    //     }

    //     return value;
    // }

    /**
     * Validate return percentage.
     */
    validatePercentage(
        percentage: number,
    ): number {

        if (
            !Number.isFinite(
                percentage,
            ) ||
            percentage <= 0
        ) {
            throw new InvalidSharePercentageError();
        }

        return Number(
            percentage.toFixed(4),
        );
    }

    /**
     * Validate cycle.
     */
    validateCycle(
        cycleDays: number,
    ): number {

        if (
            !Number.isInteger(
                cycleDays,
            ) ||
            cycleDays <= 0
        ) {
            throw new InvalidShareCycleError();
        }

        return cycleDays;
    }

    /**
     * Validate status.
     */
    validateStatus(
        status: string,
    ): ShareStatus {

        if (
            !Object.values(
                ShareStatus,
            ).includes(
                status as ShareStatus,
            )
        ) {
            throw new InvalidShareStatusError();
        }

        return status as ShareStatus;
    }

    /**
     * Validate pagination.
     */
    validatePagination(
        page?: number,
        limit?: number,
    ) {

        const normalizedPage =
            page && page > 0
                ? Math.floor(page)
                : 1;

        const normalizedLimit =
            limit && limit > 0
                ? Math.min(
                    Math.floor(limit),
                    100,
                )
                : 20;

        return {
            page: normalizedPage,
            limit: normalizedLimit,
        };
    }
}


export const shareValidation =
    new ShareValidation();