import { describe, expect, it } from "vitest";

import {
    WalletError,
    WalletNotFoundError,
    InvalidWalletAmountError,
    InsufficientBalanceError,
    InsufficientHeldBalanceError,
    WalletAlreadyExistsError,
} from "./wallet.errors";

describe("Wallet Errors", () => {

    describe("WalletError", () => {

        it("should create the base wallet error", () => {

            const error = new WalletError(
                "Something went wrong.",
            );

            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(WalletError);

            expect(error.name).toBe(
                "WalletError",
            );

            expect(error.message).toBe(
                "Something went wrong.",
            );

        });

    });

    describe("WalletNotFoundError", () => {

        it("should create the correct error", () => {

            const error = new WalletNotFoundError();

            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(WalletError);
            expect(error).toBeInstanceOf(
                WalletNotFoundError,
            );

            expect(error.name).toBe(
                "WalletNotFoundError",
            );

            expect(error.message).toBe(
                "Wallet not found.",
            );

        });

    });

    describe("InvalidWalletAmountError", () => {

        it("should create the correct error", () => {

            const error =
                new InvalidWalletAmountError();

            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(WalletError);
            expect(error).toBeInstanceOf(
                InvalidWalletAmountError,
            );

            // Matches your current implementation
            expect(error.name).toBe(
                "InvalidWalletAmountError",
            );

            expect(error.message).toBe(
                "Amount must be greater than zero.",
            );

        });

    });

    describe("InsufficientBalanceError", () => {

        it("should create the correct error", () => {

            const error =
                new InsufficientBalanceError();

            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(WalletError);
            expect(error).toBeInstanceOf(
                InsufficientBalanceError,
            );

            expect(error.name).toBe(
                "InsufficientBalanceError",
            );

            expect(error.message).toBe(
                "Insufficient available balance.",
            );

        });

    });

    describe("InsufficientHeldBalanceError", () => {

        it("should create the correct error", () => {

            const error =
                new InsufficientHeldBalanceError();

            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(WalletError);
            expect(error).toBeInstanceOf(
                InsufficientHeldBalanceError,
            );

            expect(error.name).toBe(
                "InsufficientHeldBalanceError",
            );

            expect(error.message).toBe(
                "Insufficient held balance.",
            );

        });

    });

    describe("WalletAlreadyExistsError", () => {

        it("should create the correct error", () => {

            const error =
                new WalletAlreadyExistsError();

            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(WalletError);
            expect(error).toBeInstanceOf(
                WalletAlreadyExistsError,
            );

            expect(error.name).toBe(
                "WalletAlreadyExistsError",
            );

            expect(error.message).toBe(
                "Wallet already exists.",
            );

        });

    });

});