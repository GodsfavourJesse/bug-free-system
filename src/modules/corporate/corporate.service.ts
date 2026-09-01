import { db } from "../../database";

import {
    corporateRepository,
} from "./corporate.repository";

import {
    CreateCorporateAnnouncementDto,
    UpdateCorporateAnnouncementDto,
} from "./corporate.dto";

import {
    CorporateAnnouncementNotFoundError,
} from "./corporate.errors";

import {
    corporateValidation,
} from "./corporate.validation";

export class CorporateService {

    // ========================================================
    // USER
    // ========================================================

    /**
     * Get all published corporate announcements
     * for a user, including read status.
     */
    async getUserAnnouncements(
        userId: string,
    ) {

        const announcements =
            await corporateRepository
                .findPublishedForUser(
                    db,
                    userId,
                );

        return announcements.map(
            (announcement) => ({
                ...announcement,

                isRead:
                    Boolean(
                        announcement.isRead,
                    ),
            }),
        );
    }

    /**
     * Mark corporate announcement as read.
     */
    async markAsRead(
        announcementId: string,
        userId: string,
    ) {

        const announcement =
            await corporateRepository.findById(
                db,
                announcementId,
            );

        if (!announcement) {
            throw new CorporateAnnouncementNotFoundError();
        }

        return corporateRepository.markAsRead(
            db,
            {
                announcementId,
                userId,
            },
        );
    }

    // ========================================================
    // ADMIN
    // ========================================================

    async getAllAnnouncements() {

        return corporateRepository.findAll(
            db,
        );
    }

    async getAnnouncement(
        id: string,
    ) {

        const announcement =
            await corporateRepository.findById(
                db,
                id,
            );

        if (!announcement) {
            throw new CorporateAnnouncementNotFoundError();
        }

        return announcement;
    }

    async createAnnouncement(
        adminId: string,
        dto: CreateCorporateAnnouncementDto,
    ) {

        const title =
            corporateValidation.validateTitle(
                dto.title,
            );

        const message =
            corporateValidation.validateMessage(
                dto.message,
            );

        const isPublished =
            dto.isPublished ?? true;

        return corporateRepository.createAnnouncement(
            db,
            {
                title,
                message,
                createdBy: adminId,
                isPublished,

                publishedAt:
                    isPublished
                        ? new Date()
                        : null,
            },
        );
    }

    async updateAnnouncement(
        id: string,
        dto: UpdateCorporateAnnouncementDto,
    ) {

        const existing =
            await corporateRepository.findById(
                db,
                id,
            );

        if (!existing) {
            throw new CorporateAnnouncementNotFoundError();
        }

        const title =
            corporateValidation.validateOptionalTitle(
                dto.title,
            );

        const message =
            corporateValidation.validateOptionalMessage(
                dto.message,
            );

        const data:
            Partial<
                typeof import(
                    "../../database/schema"
                ).corporateAnnouncements.$inferInsert
            > = {};

        if (title !== undefined) {
            data.title = title;
        }

        if (message !== undefined) {
            data.message = message;
        }

        if (dto.isPublished !== undefined) {

            data.isPublished =
                dto.isPublished;

            /**
             * Only assign a publication date
             * when transitioning into published.
             */
            if (
                dto.isPublished &&
                !existing.isPublished
            ) {
                data.publishedAt =
                    new Date();
            }

            /**
             * Keep publishedAt untouched when
             * simply editing an already published
             * announcement.
             */
        }

        return corporateRepository.updateAnnouncement(
            db,
            id,
            data,
        );
    }

    async publish(
        id: string,
    ) {

        const announcement =
            await corporateRepository.findById(
                db,
                id,
            );

        if (!announcement) {
            throw new CorporateAnnouncementNotFoundError();
        }

        if (announcement.isPublished) {
            return announcement;
        }

        return corporateRepository.updateAnnouncement(
            db,
            id,
            {
                isPublished: true,
                publishedAt: new Date(),
            },
        );
    }

    async unpublish(
        id: string,
    ) {

        const announcement =
            await corporateRepository.findById(
                db,
                id,
            );

        if (!announcement) {
            throw new CorporateAnnouncementNotFoundError();
        }

        if (!announcement.isPublished) {
            return announcement;
        }

        return corporateRepository.updateAnnouncement(
            db,
            id,
            {
                isPublished: false,
            },
        );
    }

    async deleteAnnouncement(
        id: string,
    ) {

        const announcement =
            await corporateRepository.findById(
                db,
                id,
            );

        if (!announcement) {
            throw new CorporateAnnouncementNotFoundError();
        }

        await corporateRepository.deleteAnnouncement(
            db,
            id,
        );
    }
}

export const corporateService =
    new CorporateService();