import { InvalidSharePurchaseAmountError } from "./sharePurchase.errors";

export class SharePurchaseCalculationService {

    calculate(
        amount: number,
        percentage: number,
        cycleDays: number,
        startDate: Date = new Date(),
    ) {

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            throw new InvalidSharePurchaseAmountError();
        }

        if (
            !Number.isFinite(percentage) ||
            percentage <= 0
        ) {
            throw new Error(
                "Share percentage must be greater than zero.",
            );
        }

        if (
            !Number.isInteger(cycleDays) ||
            cycleDays <= 0
        ) {
            throw new Error(
                "Share cycle must be greater than zero days.",
            );
        }

        /**
         * Example:
         *
         * amount = 50,000
         * percentage = 16
         *
         * dailyReturn =
         * 50,000 × 16 / 100
         *
         * = 8,000
         */
        const dailyReturn =
            amount * (percentage / 100);

        /**
         * Total return across the complete cycle.
         */
        const totalReturn =
            dailyReturn * cycleDays;

        /**
         * Cycle expiration.
         */
        const expiresAt =
            new Date(startDate);

        expiresAt.setDate(
            expiresAt.getDate() + cycleDays,
        );

        return {
            purchaseAmount:
                Number(amount.toFixed(2)),

            dailyReturn:
                Number(dailyReturn.toFixed(2)),

            cycleDays,

            totalReturn:
                Number(totalReturn.toFixed(2)),

            expectedReturnAt:
                new Date(expiresAt),

            expiresAt,
        };
    }
}

export const sharePurchaseCalculation =
    new SharePurchaseCalculationService();