export class SupportError extends Error {
    constructor(message: string) {
        super(message);

        this.name = "SupportError";
    }
}

/**
 * Conversation does not exist.
 */
export class SupportConversationNotFoundError
    extends SupportError
{
    constructor() {
        super(
            "Support conversation not found.",
        );

        this.name =
            "SupportConversationNotFoundError";
    }
}

/**
 * Message does not exist.
 */
export class SupportMessageNotFoundError
    extends SupportError
{
    constructor() {
        super(
            "Support message not found.",
        );

        this.name =
            "SupportMessageNotFoundError";
    }
}

/**
 * Message cannot be empty.
 */
export class SupportMessageEmptyError
    extends SupportError
{
    constructor() {
        super(
            "Support message cannot be empty.",
        );

        this.name =
            "SupportMessageEmptyError";
    }
}

/**
 * Message exceeds allowed length.
 */
export class SupportMessageTooLongError
    extends SupportError
{
    constructor(
        maxLength: number,
    ) {
        super(
            `Support message cannot exceed ${maxLength} characters.`,
        );

        this.name =
            "SupportMessageTooLongError";
    }
}

/**
 * Conversation is closed.
 */
export class SupportConversationClosedError
    extends SupportError
{
    constructor() {
        super(
            "This support conversation is closed.",
        );

        this.name =
            "SupportConversationClosedError";
    }
}

/**
 * User attempted to access another
 * user's conversation.
 */
export class SupportConversationAccessDeniedError
    extends SupportError
{
    constructor() {
        super(
            "You do not have access to this support conversation.",
        );

        this.name =
            "SupportConversationAccessDeniedError";
    }
}

/**
 * Invalid conversation status.
 */
export class InvalidSupportConversationStatusError
    extends SupportError
{
    constructor() {
        super(
            "Invalid support conversation status.",
        );

        this.name =
            "InvalidSupportConversationStatusError";
    }
}

/**
 * User does not exist.
 */
export class SupportUserNotFoundError
    extends SupportError
{
    constructor() {
        super(
            "User not found.",
        );

        this.name =
            "SupportUserNotFoundError";
    }
}