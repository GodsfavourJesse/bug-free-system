import { db } from "../../database";

import {
    ShareStatus,
} from "../../database/enums/share.enum";

import {
    shareRepository,
} from "./share.repository";

import {
    shareValidation,
} from "./share.validation";

import {
    ShareListQueryDto,
} from "./share.dto";

import {
    ShareNotFoundError,
} from "./share.errors";


export class ShareService {

    /**
     * Build pagination metadata.
     */
    private buildPagination(
        page: number,
        limit: number,
        total: number,
    ) {
        const totalPages =
            Math.ceil(
                total / limit,
            );

        return {
            page,
            limit,
            total,
            totalPages,

            hasNextPage:
                page < totalPages,

            hasPreviousPage:
                page > 1,
        };
    }


    /**
     * Get one share.
     *
     * USER ACCESS
     *
     * This method is intentionally
     * read-only.
     */
    async findById(
        id: string,
    ) {

        const share =
            await shareRepository.findById(
                db,
                id,
            );

        if (!share) {
            throw new ShareNotFoundError();
        }

        return share;
    }


    /**
     * List shares available for investment.
     *
     * USER ACCESS
     *
     * IMPORTANT:
     * Users can only see shares that are
     * currently IN_PROGRESS.
     */
    async findAll(
        query: ShareListQueryDto = {},
    ) {

        const {
            page,
            limit,
        } =
            shareValidation.validatePagination(
                query.page,
                query.limit,
            );


        const result =
            await shareRepository.findAll(
                db,
                {
                    page,
                    limit,

                    /**
                     * IMPORTANT:
                     *
                     * Never trust a user-supplied status
                     * when determining investment availability.
                     *
                     * Only IN_PROGRESS shares are
                     * available for investment.
                     */
                    status:
                        ShareStatus.IN_PROGRESS,

                    search:
                        query.search?.trim(),
                },
            );


        return {
            data:
                result.data,

            pagination:
                this.buildPagination(
                    page,
                    limit,
                    result.total,
                ),
        };
    }
    
}


export const shareService =
    new ShareService();