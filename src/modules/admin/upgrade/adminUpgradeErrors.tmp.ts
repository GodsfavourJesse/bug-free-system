export class AdminUpgradeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AdminUpgradeError";
    }
}

export class UpgradeRequestNotPendingError extends AdminUpgradeError {
    constructor() {
        super(
            "Only pending upgrade requests can be marked as under review.",
        );

        this.name =
            "UpgradeRequestNotPendingError";
    }
}