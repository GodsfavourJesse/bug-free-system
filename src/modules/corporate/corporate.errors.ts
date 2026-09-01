export class CorporateAnnouncementError extends Error {
    constructor(message: string) {
        super(message);

        this.name = "CorporateAnnouncementError";
    }
}

export class CorporateAnnouncementNotFoundError
    extends CorporateAnnouncementError {

    constructor() {
        super("Corporate announcement not found.");

        this.name =
            "CorporateAnnouncementNotFoundError";
    }
}

export class CorporateAnnouncementTitleRequiredError
    extends CorporateAnnouncementError {

    constructor() {
        super("Corporate announcement title is required.");

        this.name =
            "CorporateAnnouncementTitleRequiredError";
    }
}

export class CorporateAnnouncementMessageRequiredError
    extends CorporateAnnouncementError {

    constructor() {
        super("Corporate announcement message is required.");

        this.name =
            "CorporateAnnouncementMessageRequiredError";
    }
}

export class CorporateAnnouncementTitleTooLongError
    extends CorporateAnnouncementError {

    constructor(maxLength: number) {
        super(
            `Corporate announcement title cannot exceed ${maxLength} characters.`,
        );

        this.name =
            "CorporateAnnouncementTitleTooLongError";
    }
}

export class CorporateAnnouncementMessageTooLongError
    extends CorporateAnnouncementError {

    constructor(maxLength: number) {
        super(
            `Corporate announcement message cannot exceed ${maxLength} characters.`,
        );

        this.name =
            "CorporateAnnouncementMessageTooLongError";
    }
}