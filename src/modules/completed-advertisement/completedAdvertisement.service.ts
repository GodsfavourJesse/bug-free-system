import { CompletedAdvertisement, CreateCompletedAdvertisementDto } from "./completedAdvertisement.dto";
import { completedAdvertisementRepository } from "./completedAdvertisement.repository";
import { completedAdvertisementValidation } from "./completedAdvertisement.vaidation";

export class CompletedAdvertisementService {

    /**
     * Record a completed advertisement.
     */
    async complete(
        dto: CreateCompletedAdvertisementDto,
    ): Promise<CompletedAdvertisement> {

        const existing =
            await completedAdvertisementRepository.findByUserAndAdvertisement(
                undefined,
                dto.userId,
                dto.advertisementId,
            );

        completedAdvertisementValidation.ensureNotCompleted(
            existing,
        );

        return completedAdvertisementRepository.create(
            undefined,
            dto,
        );
    }

    /**
     * Determine whether a user has already
     * completed an advertisement.
     */
    async hasCompleted(
        userId: string,
        advertisementId: string,
    ): Promise<boolean> {

        const completion =
            await completedAdvertisementRepository.findByUserAndAdvertisement(
                undefined,
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
        userId: string,
    ): Promise<CompletedAdvertisement[]> {

        return completedAdvertisementRepository.findByUser(
            undefined,
            userId,
        );
    }

    /**
     * Count how many users have completed
     * an advertisement.
     */
    async countCompleted(
        advertisementId: string,
    ): Promise<number> {

        return completedAdvertisementRepository.countByAdvertisement(
            undefined,
            advertisementId,
        );
    }

    async countCompletedToday(
        userId: string,
    ): Promise<number> {

        return completedAdvertisementRepository.countCompletedToday(
            undefined,
            userId,
        );
    }
}

export const completedAdvertisementService =
    new CompletedAdvertisementService();