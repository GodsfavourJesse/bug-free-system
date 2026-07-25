export class NotificationError extends Error {

    constructor(message: string) {
        super(message);

        this.name = "NotificationError";
    }
}

export class NotificationNotFoundError extends NotificationError {

    constructor() {
        super("Notification not found.");

        this.name =
            "NotificationNotFoundError";
    }
}

export class NotificationTitleTooLongError extends NotificationError {

    constructor(message: string) {
        super(message);

        this.name =
            "NotificationTitleTooLongError";
    }
}

export class NotificationMessageTooLongError extends NotificationError {

    constructor(message: string) {
        super(message);

        this.name =
            "NotificationMessageTooLongError";
    }
}