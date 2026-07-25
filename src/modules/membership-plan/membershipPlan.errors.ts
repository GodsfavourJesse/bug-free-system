export class MembershipPlanError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MembershipPlanError";
    }
}

export class MembershipPlanNotFoundError extends MembershipPlanError {
    constructor() {
        super("Membership plan not found.");
        this.name = "MembershipPlanNotFoundError";
    }
}

export class MembershipPlanInactiveError extends MembershipPlanError {
    constructor() {
        super("Membership plan is inactive.");
        this.name = "MembershipPlanInactiveError";
    }
}

export class MembershipPlanNotUpgradeableError extends MembershipPlanError {
    constructor() {
        super(
            "This membership plan cannot be upgraded to.",
        );

        this.name =
            "MembershipPlanNotUpgradeableError";
    }
}

export class HighestMembershipPlanError extends MembershipPlanError {
    constructor() {
        super(
            "User is already on the highest membership plan.",
        );

        this.name =
            "HighestMembershipPlanError";
    }
}

export class InvalidMembershipUpgradeError extends MembershipPlanError {
    constructor(
        message = "Invalid membership upgrade.",
    ) {
        super(message);

        this.name =
            "InvalidMembershipUpgradeError";
    }
}