import { CompletedAdvertisement } from "./completedAdvertisement.dto";
import {
    AlreadyCompletedAdvertisementError,
    CompletedAdvertisementNotFoundError,
} from "./completedAdvertisement.errors";

export class CompletedAdvertisementValidation {

    /**
     * Ensure the user has not already completed
     * the advertisement.
     */
    ensureNotCompleted(
        completion: CompletedAdvertisement | null,
    ) {
        if (completion) {
            throw new AlreadyCompletedAdvertisementError(
                "Advertisement has already been completed.",
            );
        }

        return completion;
    }

    /**
     * Ensure the completion record exists.
     */
    ensureCompletionExists(
        completion: CompletedAdvertisement | null,
    ) {
        if (!completion) {
            throw new CompletedAdvertisementNotFoundError(
                "Completed advertisement not found.",
            );
        }

        return completion;
    }
}

export const completedAdvertisementValidation =
    new CompletedAdvertisementValidation();