import { Advertisement } from "./advertisement.dto";
import { AdvertisementStatus } from "../../../database/enums/advertisement.enum";

export class AdvertisementValidation {

    /**
     * Ensure the advertisement exists.
     */
    ensureExists(
        advertisement: Advertisement | null,
    ): Advertisement {
        if (!advertisement) {
            throw new Error(
                "Advertisement not found.",
            );
        }

        return advertisement;
    }

    /**
     * Ensure the advertisement is active.
     */
    ensureActive(
        advertisement: Advertisement,
    ) {
        if (
            advertisement.status !==
            AdvertisementStatus.ACTIVE
        ) {
            throw new Error(
                "Advertisement is not active.",
            );
        }
    }

    /**
     * Ensure the advertisement has not expired.
     */
    ensureNotExpired(
        advertisement: Advertisement,
    ) {
        if (
            advertisement.status ===
            AdvertisementStatus.EXPIRED
        ) {
            throw new Error(
                "Advertisement has expired.",
            );
        }

        if (
            advertisement.endDate &&
            advertisement.endDate < new Date()
        ) {
            throw new Error(
                "Advertisement has expired.",
            );
        }
    }

    /**
     * Ensure the advertisement is currently
     * within its publishing schedule.
     */
    ensureWithinSchedule(
        advertisement: Advertisement,
    ) {
        const now = new Date();

        if (
            advertisement.startDate &&
            advertisement.startDate > now
        ) {
            throw new Error(
                "Advertisement campaign has not started yet.",
            );
        }

        if (
            advertisement.endDate &&
            advertisement.endDate < now
        ) {
            throw new Error(
                "Advertisement campaign has ended.",
            );
        }
    }

    /**
     * Ensure the target URL exists
     * and is a valid HTTP/HTTPS URL.
     * it's optional
     */
    ensureTargetUrl(
        url?: string | null,
    ) {
        if (
            url === undefined ||
            url === null ||
            url.trim() === ""
        ) {
            return null;
        }

        try {
            new URL(url);
        } catch {
            throw new Error(
                "Invalid advertisement target URL.",
            );
        }

        return url;
    }

    /**
     * Ensure required images exist.
     */
    ensureImages(data: {
        thumbnailUrl: string | null;
    }) {
        if (!data.thumbnailUrl) {
            throw new Error(
                "Thumbnail image is required.",
            );
        }
    }

    /**
     * Ensure the advertisement
     * can be published.
     */
    ensureTaskReady(ad: Advertisement) {
        if (!ad.title) {
            throw new Error("Title is required.");
        }

        if (!ad.shortDescription) {
            throw new Error("Short description is required.");
        }

        if (!ad.fullDescription) {
            throw new Error("Full description is required.");
        }

        if (!ad.thumbnailUrl) {
            throw new Error("Thumbnail is required.");
        }
    }

    /**
     * Ensure the schedule is valid.
     */
    ensureSchedule(
        startDate: Date | null,
        endDate: Date | null,
    ) {
        if (!startDate) {
            throw new Error(
                "Start date is required.",
            );
        }

        if (!endDate) {
            throw new Error(
                "End date is required.",
            );
        }

        if (startDate >= endDate) {
            throw new Error(
                "Start date must be earlier than end date.",
            );
        }
    }

}

export const advertisementValidation =
    new AdvertisementValidation();