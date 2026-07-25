import { vi } from "vitest";

export const walletRepository = {
    create: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    lockByUserId: vi.fn(),
    updateBalances: vi.fn(),
};