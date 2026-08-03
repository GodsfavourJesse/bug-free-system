import { DbExecutor } from "../../database/types/types";
import { db } from "../../database";

import {
    CompletedAdvertisement,
    CreateCompletedAdvertisementDto,
} from "./completedAdvertisement.dto";

import { completedAdvertisementRepository } from "./completedAdvertisement.repository";
import { completedAdvertisementValidation } from "./completedAdvertisement.vaidation";

export class CompletedAdvertisementService {

    /**
     * Record a completed advertisement.
     */
    async complete(
        executor: DbExecutor = db,
        dto: CreateCompletedAdvertisementDto,
    ): Promise<CompletedAdvertisement> {

        const existing =
            await completedAdvertisementRepository.findByUserAndAdvertisement(
                executor,
                dto.userId,
                dto.advertisementId,
            );

        completedAdvertisementValidation.ensureNotCompleted(
            existing,
        );

        return completedAdvertisementRepository.create(
            executor,
            dto,
        );
    }

    /**
     * Determine whether a user has already
     * completed an advertisement.
     */
    async hasCompleted(
        executor: DbExecutor = db,
        userId: string,
        advertisementId: string,
    ): Promise<boolean> {

        const completion =
            await completedAdvertisementRepository.findByUserAndAdvertisement(
                executor,
                userId,
                advertisementId,
            );

        return completion !== null;
    }

    /**
     * Get all completed advertisements
     * for a user.
     */
    async getUserCompleted(
        executor: DbExecutor = db,
        userId: string,
    ): Promise<CompletedAdvertisement[]> {

        return completedAdvertisementRepository.findByUser(
            executor,
            userId,
        );
    }

    /**
     * Count how many users have completed
     * an advertisement.
     */
    async countCompleted(
        executor: DbExecutor = db,
        advertisementId: string,
    ): Promise<number> {

        return completedAdvertisementRepository.countByAdvertisement(
            executor,
            advertisementId,
        );
    }

    /**
     * Count how many advertisements
     * the user completed today.
     */
    async countCompletedToday(
        executor: DbExecutor = db,
        userId: string,
    ): Promise<number> {

        return completedAdvertisementRepository.countCompletedToday(
            executor,
            userId,
        );
    }

    /**
     * Return every advertisement ID
     * the user has completed.
     */
    async getCompletedAdvertisementIds(
        executor: DbExecutor = db,
        userId: string,
    ): Promise<string[]> {

        return completedAdvertisementRepository.findCompletedAdvertisementIds(
            executor,
            userId,
        );
    }
}

export const completedAdvertisementService =
    new CompletedAdvertisementService();