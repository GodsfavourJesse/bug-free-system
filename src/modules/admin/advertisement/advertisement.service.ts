import { db } from "../../../database";
import { AdvertisementStatus } from "../../../database/enums/advertisement.enum";

import {
    CreateAdvertisementDto,
    UpdateAdvertisementDto,
} from "./advertisement.dto";

import {
    advertisementRepository,
} from "./advertisement.repository";

import {
    advertisementValidation,
} from "./advertisement.validation";

export class AdvertisementService {

    private readonly repository =
        advertisementRepository;

    private readonly validation =
        advertisementValidation;

    async create(
        dto: CreateAdvertisementDto,
    ) {
        this.validation.ensureTargetUrl(
            dto.targetUrl,
        );

        this.validation.ensureImages({
            thumbnailUrl: dto.thumbnailUrl,
        });

        const existing =
            await this.repository.findBySlug(
                db,
                dto.slug,
            );

        if (existing) {
            throw new Error(
                "Advertisement slug already exists.",
            );
        }

        return this.repository.create(
            db,
            {
                ...dto,
                status: AdvertisementStatus.ACTIVE,
            },
        );
    }

    async update(
        advertisementId: string,
        dto: UpdateAdvertisementDto,
    ) {
        // Find advertisement.
        const advertisement =
            await this.repository.findById(
                db,
                advertisementId,
            );

        // Ensure it exists.
        this.validation.ensureExists(
            advertisement,
        );

        // If the slug is changing,
        // ensure the new slug is unique.
        if (
            dto.slug &&
            dto.slug !== advertisement.slug
        ) {
            const existing =
                await this.repository.findBySlug(
                    db,
                    dto.slug,
                );

            if (
                existing &&
                existing.id !==
                    advertisement.id
            ) {
                throw new Error(
                    "Advertisement slug already exists.",
                );
            }
        }

        // Validate schedule if either date
        // is being updated.
        if (
            dto.startDate !== undefined ||
            dto.endDate !== undefined
        ) {
            this.validation.ensureSchedule(
                dto.startDate ??
                    advertisement.startDate,
                dto.endDate ??
                    advertisement.endDate,
            );
        }

        // Update advertisement.
        const updated =
            await this.repository.update(
                db,
                advertisementId,
                dto,
            );

        return updated;
    }

    async delete(
        advertisementId: string,
    ) {
        const advertisement =
            await this.repository.findById(
                db,
                advertisementId,
            );

        this.validation.ensureExists(
            advertisement,
        );

        return this.repository.delete(
            db,
            advertisementId,
        );
    }

    async activate(
        advertisementId: string,
    ) {
        // Find advertisement.
        const advertisement = await this.repository.findById(
            db,
            advertisementId,
        );

        // Ensure it exists.
        const existing = this.validation.ensureExists(
            advertisement,
        );

        // Ensure it has everything
        // required to be published.
        this.validation.ensureTaskReady(
            existing,
        );

        // Ensure it has not expired.
        this.validation.ensureNotExpired(
            existing,
        );

        // Ensure current date is within
        // the campaign schedule.
        this.validation.ensureWithinSchedule(
            existing,
        );

        // Activate advertisement.
        return this.repository.updateStatus(
            db,
            advertisementId,
            AdvertisementStatus.ACTIVE,
        );
    }

    async deactivate(
        advertisementId: string,
    ) {
        // Find advertisement.
        const advertisement =
            await this.repository.findById(
                db,
                advertisementId,
            );

        // Ensure it exists.
        this.validation.ensureExists(
            advertisement,
        );

        // Deactivate advertisement.
        return this.repository
            .updateStatus(
                db,
                advertisementId,
                AdvertisementStatus.INACTIVE,
            );
    }

    async schedule(
        advertisementId: string,
        startDate: Date,
        endDate: Date,
    ) {
        // Find advertisement.
        const advertisement =
            await this.repository.findById(
                db,
                advertisementId,
            );

        // Ensure it exists.
        this.validation.ensureExists(
            advertisement,
        );

        // Validate schedule.
        this.validation.ensureSchedule(
            startDate,
            endDate,
        );

        // Update advertisement.
        const updated =
            await this.repository.update(
                db,
                advertisementId,
                {
                    startDate,
                    endDate,
                },
            );

        // Change status to scheduled.
        return this.repository.updateStatus(
            db,
            updated.id,
            AdvertisementStatus.SCHEDULED,
        );
    }

    async publish(
        advertisementId: string,
    ) {
        // Find advertisement.
        const advertisement =
            await this.repository.findById(
                db,
                advertisementId,
            );

        // Ensure it exists.
        const existing =
            this.validation.ensureExists(
                advertisement,
            );

        // Ensure it can be published.
        this.validation.ensureTaskReady(
            existing,
        );

        // Ensure the advertisement
        // has not already expired.
        this.validation.ensureNotExpired(
            existing,
        );

        const now = new Date();

        // Future campaign.
        if (
            existing.startDate &&
            existing.startDate > now
        ) {
            return this.repository.updateStatus(
                db,
                advertisementId,
                AdvertisementStatus.SCHEDULED,
            );
        }

        // Campaign can start immediately.
        return this.repository.updateStatus(
            db,
            advertisementId,
            AdvertisementStatus.ACTIVE,
        );
    }

    async expire() {
        const expiredAdvertisements =
            await this.repository.findExpired(
                db,
            );

        const results = [];

        for (const advertisement of expiredAdvertisements) {
            const updated =
                await this.repository.updateStatus(
                    db,
                    advertisement.id,
                    AdvertisementStatus.EXPIRED,
                );

            results.push(updated);
        }

        return results;
    }

    async getAdvertisement(
        advertisementId: string,
    ) {
        // Find advertisement.
        const advertisement =
            await this.repository.findById(
                db,
                advertisementId,
            );

        // Ensure it exists.
        return this.validation.ensureExists(
            advertisement,
        );
    }

    async getAdvertisements() {
        return this.repository.findAll(
            db,
        );
    }

    async recordView(
        advertisementId: string,
    ) {
        // Find advertisement.
        const advertisement =
            await this.repository.findById(
                db,
                advertisementId,
            );

        // Ensure it exists.
        const existing =
            this.validation.ensureExists(
                advertisement,
            );

        // Only active advertisements
        // can receive views.
        this.validation.ensureActive(
            existing,
        );

        // Ensure the advertisement
        // has not expired.
        this.validation.ensureNotExpired(
            existing,
        );

        // Ensure the campaign is
        // currently running.
        this.validation.ensureWithinSchedule(
            existing,
        );

        // Increment view count.
        return this.repository
            .incrementViews(
                db,
                advertisementId,
            );
    }

    async recordCompletion(
        advertisementId: string,
    ) {
        // Find advertisement.
        const advertisement =
            await this.repository.findById(
                db,
                advertisementId,
            );

        // Ensure it exists.
        const existing =
            this.validation.ensureExists(
                advertisement,
            );

        // Only active advertisements
        // can receive completions.
        this.validation.ensureActive(
            existing,
        );

        // Ensure the advertisement
        // has not expired.
        this.validation.ensureNotExpired(
            existing,
        );

        // Ensure the campaign is
        // currently running.
        this.validation.ensureWithinSchedule(
            existing,
        );

        // Increment completion count.
        return this.repository
            .incrementCompletions(
                db,
                advertisementId,
            );
    }

    async getRandomAdvertisements(
        limit: number,
    ) {
        // Get random active advertisements.
        const advertisements = await this.repository.findRandomAdvertisements(
            db,
            limit,
        );

        const now = new Date();

        // Keep only advertisements that
        // are currently eligible.
        return advertisements.filter(
            (
                advertisement,
            ) => {
                try {
                    this.validation.ensureActive(
                        advertisement,
                    );

                    this.validation.ensureNotExpired(
                        advertisement,
                    );

                    this.validation.ensureWithinSchedule(
                        advertisement,
                    );

                    return true;
                } catch {
                    return false;
                }
            },
        );
    }

}

export const advertisementService =
    new AdvertisementService();