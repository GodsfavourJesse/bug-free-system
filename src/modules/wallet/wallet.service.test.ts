import { describe, it, expect, vi, beforeEach } from "vitest";

import { walletService } from "./wallet.service";
import { walletRepository } from "./wallet.repository";
import { walletValidation } from "./wallet.validation";
import { withTransaction } from "@/database/transaction/transaction";

vi.mock("./wallet.repository", () => ({
    walletRepository: {
        findByUserId: vi.fn(),
        create: vi.fn(),
        lockByUserId: vi.fn(),
        updateBalances: vi.fn(),
    },
}));

vi.mock("@/database/transaction/transaction", () => ({
    withTransaction: vi.fn(),
}));

vi.mock("./wallet.validation", () => ({
    walletValidation: {
        validateAmount: vi.fn((amount) => amount),
        ensureWalletExists: vi.fn((wallet) => wallet),
        ensureAvailableBalance: vi.fn(),
        ensureHeldBalance: vi.fn(),
        toDecimal: vi.fn((value) => value.toFixed(2)),
    },
}));

describe("WalletService", () => {
    beforeEach(() => {
        vi.resetAllMocks();

        vi.mocked(walletValidation.validateAmount)
            .mockImplementation((amount) => amount);

        vi.mocked(walletValidation.ensureWalletExists)
            .mockImplementation((wallet) => wallet);

        vi.mocked(walletValidation.ensureAvailableBalance)
            .mockImplementation(() => {});

        vi.mocked(walletValidation.ensureHeldBalance)
            .mockImplementation(() => {});

        vi.mocked(walletValidation.toDecimal)
            .mockImplementation((value) => value.toFixed(2));

        vi.mocked(withTransaction)
            .mockImplementation(async (callback: any) => callback({}));
    });

    describe("createWallet()", () => {
        it("should create a wallet for a new user", async () => {
            const userId = "user-1";

            const createdWallet = {
                id: "wallet-1",
                userId,
                availableBalance: "0.00",
                heldBalance: "0.00",
                totalEarned: "0.00",
                totalDeposited: "0.00",
                totalWithdrawn: "0.00",
            };

            (walletRepository.findByUserId as any).mockResolvedValue(null);

            (walletRepository.create as any).mockResolvedValue(createdWallet);

            (withTransaction as any).mockImplementation(
                async (callback: any) => callback({})
            );

            const result = await walletService.createWallet(userId);

            expect(walletRepository.findByUserId).toHaveBeenCalled();

            expect(walletRepository.create).toHaveBeenCalled();

            expect(result).toEqual(createdWallet);
        });

        it("should throw when wallet already exists", async () => {
            const existingWallet = {
                id: "wallet-1",
                userId: "user-1",
            };

            (walletRepository.findByUserId as any).mockResolvedValue(
                existingWallet
            );

            (withTransaction as any).mockImplementation(
                async (callback: any) => callback({})
            );

            await expect(
                walletService.createWallet("user-1")
            ).rejects.toThrow();

            expect(walletRepository.create).not.toHaveBeenCalled();
        });
    });

    describe("getWallet()", () => {
        it("should return the user's wallet", async () => {
            const wallet = {
                id: "wallet-1",
                userId: "user-1",
                availableBalance: "100.00",
                heldBalance: "20.00",
                totalEarned: "150.00",
                totalDeposited: "0.00",
                totalWithdrawn: "30.00",
            };
    
            (walletRepository.findByUserId as any).mockResolvedValue(wallet);
    
            (walletValidation.ensureWalletExists as any).mockReturnValue(wallet);
    
            const result = await walletService.getWallet("user-1");
    
            expect(walletRepository.findByUserId).toHaveBeenCalled();
    
            expect(walletValidation.ensureWalletExists)
                .toHaveBeenCalledWith(wallet);
    
            expect(result).toEqual(wallet);
        });
    
        it("should throw when the wallet does not exist", async () => {
            (walletRepository.findByUserId as any).mockResolvedValue(null);
    
            (walletValidation.ensureWalletExists as any).mockImplementation(() => {
                throw new Error("Wallet not found");
            });
    
            await expect(
                walletService.getWallet("user-1")
            ).rejects.toThrow("Wallet not found");
    
            expect(walletRepository.findByUserId).toHaveBeenCalled();
        });
    });

    describe("getBalance()", () => {
        it("should return only the wallet balances", async () => {
            const wallet = {
                id: "wallet-1",
                userId: "user-1",
                availableBalance: "100.00",
                heldBalance: "25.00",
                totalEarned: "150.00",
                totalDeposited: "50.00",
                totalWithdrawn: "20.00",
            };
    
            (walletRepository.findByUserId as any).mockResolvedValue(wallet);
    
            (walletValidation.ensureWalletExists as any).mockReturnValue(wallet);
    
            const result = await walletService.getBalance("user-1");
    
            expect(result).toEqual({
                availableBalance: "100.00",
                heldBalance: "25.00",
                totalEarned: "150.00",
                totalDeposited: "50.00",
                totalWithdrawn: "20.00",
            });
    
            expect(result).not.toHaveProperty("id");
            expect(result).not.toHaveProperty("userId");
        });
    });

    describe("credit()", () => {
        it("should increase available balance and total earned", async () => {
            const wallet = {
                id: "wallet-1",
                availableBalance: "100.00",
                heldBalance: "0.00",
                totalEarned: "50.00",
                totalDeposited: "0.00",
                totalWithdrawn: "0.00",
            };
    
            const updatedWallet = {
                ...wallet,
                availableBalance: "125.00",
                totalEarned: "75.00",
            };
    
            (walletRepository.lockByUserId as any)
                .mockResolvedValue(wallet);
    
            (walletRepository.updateBalances as any)
                .mockResolvedValue(updatedWallet);
    
            (withTransaction as any).mockImplementation(
                async (callback: any) => callback({})
            );
    
            const result = await walletService.credit(
                "user-1",
                25,
            );
    
            expect(walletValidation.validateAmount)
                .toHaveBeenCalledWith(25);
    
            expect(walletValidation.ensureWalletExists)
                .toHaveBeenCalledWith(wallet);
    
            expect(walletRepository.updateBalances)
                .toHaveBeenCalledWith(
                    {},
                    wallet.id,
                    {
                        availableBalance: "125.00",
                        totalEarned: "75.00",
                    },
                );
    
            expect(result).toEqual(updatedWallet);
        });
    
        it("should validate amount before doing anything", async () => {
            (walletValidation.validateAmount as any)
                .mockImplementation(() => {
                    throw new Error("Invalid amount");
                });
    
            await expect(
                walletService.credit("user-1", 0)
            ).rejects.toThrow("Invalid amount");
    
            expect(walletRepository.lockByUserId)
                .not.toHaveBeenCalled();
        });
    
        it("should throw when wallet does not exist", async () => {
            (walletRepository.lockByUserId as any)
                .mockResolvedValue(null);
    
            (walletValidation.ensureWalletExists as any)
                .mockImplementation(() => {
                    throw new Error("Wallet not found");
                });
    
            (withTransaction as any).mockImplementation(
                async (callback: any) => callback({})
            );
    
            await expect(
                walletService.credit("user-1", 25)
            ).rejects.toThrow("Wallet not found");
    
            expect(walletRepository.updateBalances)
                .not.toHaveBeenCalled();
        });
    });

    describe("debit()", () => {
        it("should decrease available balance", async () => {
            const wallet = {
                id: "wallet-1",
                availableBalance: "100.00",
                heldBalance: "0.00",
                totalEarned: "100.00",
                totalDeposited: "0.00",
                totalWithdrawn: "0.00",
            };
    
            const updatedWallet = {
                ...wallet,
                availableBalance: "60.00",
            };
    
            (walletRepository.lockByUserId as any)
                .mockResolvedValue(wallet);
    
            (walletRepository.updateBalances as any)
                .mockResolvedValue(updatedWallet);
    
            (withTransaction as any).mockImplementation(
                async (callback: any) => callback({})
            );
    
            const result = await walletService.debit(
                "user-1",
                40,
            );
    
            expect(walletValidation.validateAmount)
                .toHaveBeenCalledWith(40);
    
            expect(walletValidation.ensureWalletExists)
                .toHaveBeenCalledWith(wallet);
    
            expect(walletValidation.ensureAvailableBalance)
                .toHaveBeenCalledWith(100, 40);
    
            expect(walletRepository.updateBalances)
                .toHaveBeenCalledWith(
                    {},
                    wallet.id,
                    {
                        availableBalance: "60.00",
                    },
                );
    
            expect(result).toEqual(updatedWallet);
        });
    
        it("should validate amount before doing anything", async () => {
            (walletValidation.validateAmount as any)
                .mockImplementation(() => {
                    throw new Error("Invalid amount");
                });
    
            await expect(
                walletService.debit("user-1", 0)
            ).rejects.toThrow("Invalid amount");
    
            expect(walletRepository.lockByUserId)
                .not.toHaveBeenCalled();
        });
    
        it("should throw when wallet does not exist", async () => {
            (walletRepository.lockByUserId as any)
                .mockResolvedValue(null);
    
            (walletValidation.ensureWalletExists as any)
                .mockImplementation(() => {
                    throw new Error("Wallet not found");
                });
    
            (withTransaction as any).mockImplementation(
                async (callback: any) => callback({})
            );
    
            await expect(
                walletService.debit("user-1", 40)
            ).rejects.toThrow("Wallet not found");
    
            expect(walletRepository.updateBalances)
                .not.toHaveBeenCalled();
        });
    
        it("should throw when balance is insufficient", async () => {
            const wallet = {
                id: "wallet-1",
                availableBalance: "20.00",
                heldBalance: "0.00",
                totalEarned: "20.00",
                totalDeposited: "0.00",
                totalWithdrawn: "0.00",
            };
    
            (walletRepository.lockByUserId as any)
                .mockResolvedValue(wallet);
    
            (walletValidation.ensureAvailableBalance as any)
                .mockImplementation(() => {
                    throw new Error("Insufficient balance");
                });
    
            (withTransaction as any).mockImplementation(
                async (callback: any) => callback({})
            );
    
            await expect(
                walletService.debit("user-1", 50)
            ).rejects.toThrow("Insufficient balance");
    
            expect(walletRepository.updateBalances)
                .not.toHaveBeenCalled();
        });
    });

    describe("hold()", () => {
        beforeEach(() => {
            vi.clearAllMocks();

            (walletValidation.validateAmount as any)
                .mockImplementation((amount: number) => amount);

            (withTransaction as any).mockImplementation(
                async (callback: any) => callback({})
            );
        });

        it("should move funds from available balance to held balance", async () => {
            const wallet = {
                id: "wallet-1",
                availableBalance: "100.00",
                heldBalance: "20.00",
            };

            (walletRepository.lockByUserId as any)
                .mockResolvedValue(wallet);

            (walletRepository.updateBalances as any)
                .mockResolvedValue({});

            await walletService.hold("user-1", 25);

            expect(walletValidation.validateAmount)
                .toHaveBeenCalledWith(25);

            expect(walletValidation.ensureAvailableBalance)
                .toHaveBeenCalledWith(100, 25);

            expect(walletRepository.updateBalances)
                .toHaveBeenCalledWith(
                    {},
                    wallet.id,
                    {
                        availableBalance: "75.00",
                        heldBalance: "45.00",
                    },
                );
        });

        it("should validate amount before doing anything", async () => {
            (walletValidation.validateAmount as any)
                .mockImplementation(() => {
                    throw new Error("Invalid amount");
                });

            await expect(
                walletService.hold("user-1", -10)
            ).rejects.toThrow("Invalid amount");

            expect(walletRepository.lockByUserId)
                .not.toHaveBeenCalled();
        });

        it("should throw when wallet does not exist", async () => {
            (walletRepository.lockByUserId as any)
                .mockResolvedValue(null);

            (walletValidation.ensureWalletExists as any)
                .mockImplementation(() => {
                    throw new Error("Wallet not found");
                });

            await expect(
                walletService.hold("user-1", 20)
            ).rejects.toThrow("Wallet not found");

            expect(walletRepository.updateBalances)
                .not.toHaveBeenCalled();
        });

        it("should throw when balance is insufficient", async () => {
            const wallet = {
                id: "wallet-1",
                availableBalance: "10.00",
                heldBalance: "0.00",
            };

            (walletRepository.lockByUserId as any)
                .mockResolvedValue(wallet);

            (walletValidation.ensureAvailableBalance as any)
                .mockImplementation(() => {
                    throw new Error("Insufficient balance");
                });

            await expect(
                walletService.hold("user-1", 50)
            ).rejects.toThrow("Insufficient balance");

            expect(walletRepository.updateBalances)
                .not.toHaveBeenCalled();
        });
    });

    describe("release()", () => {
        beforeEach(() => {
            vi.clearAllMocks();

            (walletValidation.validateAmount as any)
                .mockImplementation((amount: number) => amount);

            (withTransaction as any).mockImplementation(
                async (callback: any) => callback({})
            );
        });

        it("should move funds from held balance back to available balance", async () => {
            const wallet = {
                id: "wallet-1",
                availableBalance: "100.00",
                heldBalance: "40.00",
            };

            (walletRepository.lockByUserId as any)
                .mockResolvedValue(wallet);

            (walletRepository.updateBalances as any)
                .mockResolvedValue({});

            await walletService.release("user-1", 15);

            expect(walletValidation.validateAmount)
                .toHaveBeenCalledWith(15);

            expect(walletValidation.ensureHeldBalance)
                .toHaveBeenCalledWith(40, 15);

            expect(walletRepository.updateBalances)
                .toHaveBeenCalledWith(
                    {},
                    wallet.id,
                    {
                        availableBalance: "115.00",
                        heldBalance: "25.00",
                    },
                );
        });

        it("should validate amount before doing anything", async () => {
            (walletValidation.validateAmount as any)
                .mockImplementation(() => {
                    throw new Error("Invalid amount");
                });

            await expect(
                walletService.release("user-1", -10)
            ).rejects.toThrow("Invalid amount");

            expect(walletRepository.lockByUserId)
                .not.toHaveBeenCalled();
        });

        it("should throw when wallet does not exist", async () => {
            (walletRepository.lockByUserId as any)
                .mockResolvedValue(null);

            (walletValidation.ensureWalletExists as any)
                .mockImplementation(() => {
                    throw new Error("Wallet not found");
                });

            await expect(
                walletService.release("user-1", 20)
            ).rejects.toThrow("Wallet not found");

            expect(walletRepository.updateBalances)
                .not.toHaveBeenCalled();
        });

        it("should throw when held balance is insufficient", async () => {
            const wallet = {
                id: "wallet-1",
                availableBalance: "100.00",
                heldBalance: "5.00",
            };

            (walletRepository.lockByUserId as any)
                .mockResolvedValue(wallet);

            (walletValidation.ensureHeldBalance as any)
                .mockImplementation(() => {
                    throw new Error("Insufficient held balance");
                });

            await expect(
                walletService.release("user-1", 20)
            ).rejects.toThrow("Insufficient held balance");

            expect(walletRepository.updateBalances)
                .not.toHaveBeenCalled();
        });
    });

    describe("withdraw()", () => {
        beforeEach(() => {
            vi.clearAllMocks();

            (walletValidation.validateAmount as any)
                .mockImplementation((amount: number) => amount);

            (withTransaction as any).mockImplementation(
                async (callback: any) => callback({})
            );
        });

        it("should decrease held balance and increase total withdrawn", async () => {
            const wallet = {
                id: "wallet-1",
                heldBalance: "100.00",
                totalWithdrawn: "25.00",
            };

            (walletRepository.lockByUserId as any)
                .mockResolvedValue(wallet);

            (walletRepository.updateBalances as any)
                .mockResolvedValue({});

            await walletService.withdraw("user-1", 40);

            expect(walletValidation.validateAmount)
                .toHaveBeenCalledWith(40);

            expect(walletValidation.ensureHeldBalance)
                .toHaveBeenCalledWith(100, 40);

            expect(walletRepository.updateBalances)
                .toHaveBeenCalledWith(
                    {},
                    wallet.id,
                    {
                        heldBalance: "60.00",
                        totalWithdrawn: "65.00",
                    },
                );
        });

        it("should validate amount before doing anything", async () => {
            (walletValidation.validateAmount as any)
                .mockImplementation(() => {
                    throw new Error("Invalid amount");
                });

            await expect(
                walletService.withdraw("user-1", -10)
            ).rejects.toThrow("Invalid amount");

            expect(walletRepository.lockByUserId)
                .not.toHaveBeenCalled();
        });

        it("should throw when wallet does not exist", async () => {
            (walletRepository.lockByUserId as any)
                .mockResolvedValue(null);

            (walletValidation.ensureWalletExists as any)
                .mockImplementation(() => {
                    throw new Error("Wallet not found");
                });

            await expect(
                walletService.withdraw("user-1", 20)
            ).rejects.toThrow("Wallet not found");

            expect(walletRepository.updateBalances)
                .not.toHaveBeenCalled();
        });

        it("should throw when held balance is insufficient", async () => {
            const wallet = {
                id: "wallet-1",
                heldBalance: "10.00",
                totalWithdrawn: "0.00",
            };

            (walletRepository.lockByUserId as any)
                .mockResolvedValue(wallet);

            (walletValidation.ensureHeldBalance as any)
                .mockImplementation(() => {
                    throw new Error("Insufficient held balance");
                });

            await expect(
                walletService.withdraw("user-1", 20)
            ).rejects.toThrow("Insufficient held balance");

            expect(walletRepository.updateBalances)
                .not.toHaveBeenCalled();
        });
    });

    describe("deposit()", () => {
        beforeEach(() => {
            vi.clearAllMocks();

            (walletValidation.validateAmount as any)
                .mockImplementation((amount: number) => amount);

            (withTransaction as any).mockImplementation(
                async (callback: any) => callback({})
            );
        });

        it("should increase available balance and total deposited", async () => {
            const wallet = {
                id: "wallet-1",
                availableBalance: "100.00",
                totalDeposited: "20.00",
            };

            (walletRepository.lockByUserId as any)
                .mockResolvedValue(wallet);

            (walletRepository.updateBalances as any)
                .mockResolvedValue({});

            await walletService.deposit("user-1", 50);

            expect(walletValidation.validateAmount)
                .toHaveBeenCalledWith(50);

            expect(walletRepository.updateBalances)
                .toHaveBeenCalledWith(
                    {},
                    wallet.id,
                    {
                        availableBalance: "150.00",
                        totalDeposited: "70.00",
                    },
                );
        });

        it("should validate amount before doing anything", async () => {
            (walletValidation.validateAmount as any)
                .mockImplementation(() => {
                    throw new Error("Invalid amount");
                });

            await expect(
                walletService.deposit("user-1", -20)
            ).rejects.toThrow("Invalid amount");

            expect(walletRepository.lockByUserId)
                .not.toHaveBeenCalled();
        });

        it("should throw when wallet does not exist", async () => {
            (walletRepository.lockByUserId as any)
                .mockResolvedValue(null);

            (walletValidation.ensureWalletExists as any)
                .mockImplementation(() => {
                    throw new Error("Wallet not found");
                });

            await expect(
                walletService.deposit("user-1", 50)
            ).rejects.toThrow("Wallet not found");

            expect(walletRepository.updateBalances)
                .not.toHaveBeenCalled();
        });
    });
});



