// corporate.validation.ts

import {
    CorporateAnnouncementMessageRequiredError,
    CorporateAnnouncementMessageTooLongError,
    CorporateAnnouncementTitleRequiredError,
    CorporateAnnouncementTitleTooLongError,
} from "./corporate.errors";

const MAX_TITLE_LENGTH = 150;
const MAX_MESSAGE_LENGTH = 10000;

export class CorporateValidation {

    validateTitle(title: string): string {

        const value = title?.trim();

        if (!value) {
            throw new CorporateAnnouncementTitleRequiredError();
        }

        if (value.length > MAX_TITLE_LENGTH) {
            throw new CorporateAnnouncementTitleTooLongError(
                MAX_TITLE_LENGTH,
            );
        }

        return value;
    }

    validateMessage(message: string): string {

        const value = message?.trim();

        if (!value) {
            throw new CorporateAnnouncementMessageRequiredError();
        }

        if (value.length > MAX_MESSAGE_LENGTH) {
            throw new CorporateAnnouncementMessageTooLongError(
                MAX_MESSAGE_LENGTH,
            );
        }

        return value;
    }

    validateOptionalTitle(
        title?: string,
    ): string | undefined {

        if (title === undefined) {
            return undefined;
        }

        return this.validateTitle(title);
    }

    validateOptionalMessage(
        message?: string,
    ): string | undefined {

        if (message === undefined) {
            return undefined;
        }

        return this.validateMessage(message);
    }
}

export const corporateValidation =
    new CorporateValidation();