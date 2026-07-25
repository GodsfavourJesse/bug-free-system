import { COMMISSION_RATES } from "@/constants/commision.constants";

export class CommissionCalculator {

    // Return commission percentage for a level.
    getPercentage(
        level: 1 | 2 | 3,
    ): number {

        switch (level) {

            case 1:
                return COMMISSION_RATES.LEVEL_1;

            case 2:
                return COMMISSION_RATES.LEVEL_2;

            case 3:
                return COMMISSION_RATES.LEVEL_3;
        }
    }

    // Calculate commission from an amount and percentage.
    calculate(
        amount: number,
        percentage: number,
    ): number {

        return this.round(
            amount * percentage,
        );
    }

    // // Calculate Level 1 commission.
    // calculateLevel1(
    //     amount: number,
    // ): number {

    //     return this.round(
    //         amount *
    //             COMMISSION_RATES.LEVEL_1,
    //     );
    // }

    // // Calculate Level 2 commission.
    // calculateLevel2(
    //     amount: number,
    // ): number {

    //     return this.round(
    //         amount *
    //             COMMISSION_RATES.LEVEL_2,
    //     );
    // }

    // // Calculate Level 3 commission.
    // calculateLevel3(
    //     amount: number,
    // ): number {

    //     return this.round(
    //         amount *
    //             COMMISSION_RATES.LEVEL_3,
    //     );
    // }

    // Calculate commission for a given level.
     // Calculate commission by level.
    calculateByLevel(
        amount: number,
        level: 1 | 2 | 3,
    ) {

        return this.calculate(
            amount,
            this.getPercentage(
                level,
            ),
        );
    }

    // Calculate the total commission paid
    // across all referral levels.
    calculateTotal(
        amount: number,
    ) {

        return this.round(
            this.calculateByLevel(
                amount,
                1,
            ) +
            this.calculateByLevel(
                amount,
                2,
            ) +
            this.calculateByLevel(
                amount,
                3,
            ),
        );
    }

    // Round monetary values to 2 decimal places.
    private round(
        value: number,
    ): number {

        return Number(
            value.toFixed(2),
        );
    }
}

export const commissionCalculator =
    new CommissionCalculator();