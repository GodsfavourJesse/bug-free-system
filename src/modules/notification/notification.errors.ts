export class NotificationError extends Error {
    constructor(message: string) {
        super(message);

        this.name = "NotificationError";
    }
}

export class NotificationNotFoundError
    extends NotificationError
{
    constructor() {
        super("Notification not found.");

        this.name =
            "NotificationNotFoundError";
    }
}

export class NotificationTitleRequiredError
    extends NotificationError
{
    constructor() {
        super(
            "Notification title is required.",
        );

        this.name =
            "NotificationTitleRequiredError";
    }
}

export class NotificationTitleTooLongError
    extends NotificationError
{
    constructor(maxLength: number) {
        super(
            `Notification title cannot exceed ${maxLength} characters.`,
        );

        this.name =
            "NotificationTitleTooLongError";
    }
}

export class NotificationMessageRequiredError
    extends NotificationError
{
    constructor() {
        super(
            "Notification message is required.",
        );

        this.name =
            "NotificationMessageRequiredError";
    }
}

export class NotificationMessageTooLongError
    extends NotificationError
{
    constructor(maxLength: number) {
        super(
            `Notification message cannot exceed ${maxLength} characters.`,
        );

        this.name =
            "NotificationMessageTooLongError";
    }
}

export class NotificationUserRequiredError extends Error {
    constructor() {
        super(
            "Notification recipient is required.",
        );

        this.name =
            "NotificationUserRequiredError";
    }
}

export class InvalidNotificationTypeError extends Error {
    constructor() {
        super(
            "Invalid notification type.",
        );

        this.name =
            "InvalidNotificationTypeError";
    }
}

export class InvalidNotificationMetadataError extends Error {
    constructor() {
        super(
            "Notification metadata must be an object.",
        );

        this.name =
            "InvalidNotificationMetadataError";
    }
}

export class NotificationUserIdRequiredError extends Error {
    constructor() {
        super("Notification recipient is required.");
        this.name = "NotificationUserIdRequiredError";
    }
}

export class NotificationTypeRequiredError extends Error {
    constructor() {
        super("Notification type is required.");
        this.name = "NotificationTypeRequiredError";
    }
}

export class NotificationTypeInvalidError extends Error {
    constructor() {
        super("Invalid notification type.");
        this.name = "NotificationTypeInvalidError";
    }
}

export class NotificationMetadataInvalidError extends Error {
    constructor() {
        super("Notification metadata must be a valid object.");
        this.name = "NotificationMetadataInvalidError";
    }
}

export class NotificationRecipientNotFoundError extends Error {
    constructor() {
        super("Notification recipient was not found.");
        this.name = "NotificationRecipientNotFoundError";
    }
}

export class NotificationRecipientInactiveError extends Error {
    constructor() {
        super("Notification recipient is inactive.");
        this.name = "NotificationRecipientInactiveError";
    }
}