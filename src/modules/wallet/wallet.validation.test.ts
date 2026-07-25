import { describe, it, expect } from "vitest";

import { walletValidation } from "./wallet.validation";

import {
    InvalidWalletAmountError,
    WalletNotFoundError,
    InsufficientBalanceError,
    InsufficientHeldBalanceError,
} from "./wallet.errors";

describe("walletValidation", () => {

    describe("validateAmount()", () => {

        it("should return a valid amount", () => {
            expect(
                walletValidation.validateAmount(100)
            ).toBe(100);
        });

        it("should throw when amount is zero", () => {
            expect(() =>
                walletValidation.validateAmount(0)
            ).toThrow(InvalidWalletAmountError);
        });

        it("should throw when amount is negative", () => {
            expect(() =>
                walletValidation.validateAmount(-50)
            ).toThrow(InvalidWalletAmountError);
        });

    });

    describe("ensureWalletExists()", () => {

        it("should return the wallet when it exists", () => {

            const wallet = {
                id: "wallet-1",
                userId: "user-1",
                availableBalance: "100.00",
                heldBalance: "20.00",
                totalEarned: "50.00",
                totalDeposited: "0.00",
                totalWithdrawn: "0.00",
            };

            expect(
                walletValidation.ensureWalletExists(wallet)
            ).toEqual(wallet);

        });

        it("should throw when wallet does not exist", () => {

            expect(() =>
                walletValidation.ensureWalletExists(null)
            ).toThrow(WalletNotFoundError);

        });

    });

    describe("ensureAvailableBalance()", () => {

        it("should pass when balance is sufficient", () => {

            expect(() =>
                walletValidation.ensureAvailableBalance(
                    100,
                    50,
                )
            ).not.toThrow();

        });

        it("should throw when balance is insufficient", () => {

            expect(() =>
                walletValidation.ensureAvailableBalance(
                    20,
                    50,
                )
            ).toThrow(InsufficientBalanceError);

        });

    });

    describe("ensureHeldBalance()", () => {

        it("should pass when held balance is sufficient", () => {

            expect(() =>
                walletValidation.ensureHeldBalance(
                    100,
                    50,
                )
            ).not.toThrow();

        });

        it("should throw when held balance is insufficient", () => {

            expect(() =>
                walletValidation.ensureHeldBalance(
                    20,
                    50,
                )
            ).toThrow(
                InsufficientHeldBalanceError
            );

        });

    });

    describe("toDecimal()", () => {

        it("should format whole numbers", () => {

            expect(
                walletValidation.toDecimal(100)
            ).toBe("100.00");

        });

        it("should round decimal numbers", () => {

            expect(
                walletValidation.toDecimal(12.345)
            ).toBe("12.35");

        });

        it("should keep two decimal places", () => {

            expect(
                walletValidation.toDecimal(12.3)
            ).toBe("12.30");

        });

    });

});