export class WalletError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "WalletError";
    }
}

// Wallet does not exist.
export class WalletNotFoundError extends WalletError {
    constructor() {
        super("Wallet not found.");
        this.name = "WalletNotFoundError";
    }
}

// Amount must be greater than zero.
export class InvalidWalletAmountError extends WalletError {
    constructor() {
        super("Amount must be greater than zero.");
        this.name = "InvalidWalletAmountError";
    }
}

// Available balance is insufficient.
export class InsufficientBalanceError extends WalletError {
    constructor() {
        super("Insufficient available balance.");
        this.name = "InsufficientBalanceError";
    }
}

// Held balance is insufficient.
export class InsufficientHeldBalanceError extends WalletError {
    constructor() {
        super("Insufficient held balance.");
        this.name = "InsufficientHeldBalanceError";
    }
}

// Wallet already exists.
export class WalletAlreadyExistsError extends WalletError {
    constructor() {
        super("Wallet already exists.");
        this.name = "WalletAlreadyExistsError";
    }
}