import {
    SupportConversationClosedError,
    SupportMessageEmptyError,
    SupportMessageTooLongError,
    InvalidSupportConversationStatusError,
} from "./support.errors";

export const MAX_SUPPORT_MESSAGE_LENGTH = 5000;

export class SupportValidation {

    /**
     * Validate support message.
     */
    validateMessage(
        message: string,
    ): string {

        const trimmed =
            message.trim();

        if (!trimmed) {
            throw new SupportMessageEmptyError();
        }

        if (
            trimmed.length >
            MAX_SUPPORT_MESSAGE_LENGTH
        ) {
            throw new SupportMessageTooLongError(
                MAX_SUPPORT_MESSAGE_LENGTH,
            );
        }

        return trimmed;
    }

    /**
     * Validate conversation status.
     */
    validateStatus(
        status: string,
    ): "open" | "closed" {

        if (
            status !== "open" &&
            status !== "closed"
        ) {
            throw new InvalidSupportConversationStatusError();
        }

        return status;
    }

    /**
     * Ensure conversation can receive
     * another message.
     */
    ensureConversationIsOpen(
        status: "open" | "closed",
    ): void {

        if (status === "closed") {
            throw new SupportConversationClosedError();
        }
    }
}

export const supportValidation =
    new SupportValidation();