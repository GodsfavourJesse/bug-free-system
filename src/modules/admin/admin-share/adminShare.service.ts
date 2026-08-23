import { db } from "../../../database";
import { shares } from "../../../database/schema";
import { ShareStatus } from "../../../database/enums/share.enum";
import { withTransaction } from "../../../database/transaction/transaction";
import { adminShareRepository } from "./adminShare.repository";

import {
    shareValidation,
} from "../../share/share.validation";

import {
    CreateAdminShareDto,
    UpdateAdminShareDto,
    AdminShareListResponseDto,
} from "./adminShare.dto";

import {
    DuplicateShareNameError,
    ShareAlreadyClosedError,
    ShareAlreadyInProgressError,
    ShareHasPurchaseHistoryError,
    ShareModificationNotAllowedError,
    ShareNotFoundError,
} from "../../share/share.errors";


export class AdminShareService {

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
     * Get paginated admin share list.
     *
     * ADMIN ONLY
     */
    async getShares(
        page: number = 1,
        limit: number = 20,
        options?: {
            status?: ShareStatus;
            search?: string;
        },
    ): Promise<AdminShareListResponseDto> {

        /**
         * Normalize page.
         */
        page =
            Number.isFinite(page)
                ? Math.floor(page)
                : 1;

        page =
            Math.max(
                1,
                page,
            );


        /**
         * Normalize limit.
         */
        limit =
            Number.isFinite(limit)
                ? Math.floor(limit)
                : 20;

        limit =
            Math.min(
                100,
                Math.max(
                    1,
                    limit,
                ),
            );


        /**
         * Normalize search.
         */
        const search =
            options?.search?.trim();


        /**
         * Get paginated shares.
         */
        const result =
            await adminShareRepository.findAll(
                db,
                page,
                limit,
                {
                    status:
                        options?.status,

                    search,
                },
            );


        /**
         * Return data + pagination.
         */
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

    /**
     * Get a single share by ID.
     *
     * ADMIN ONLY
     */
    async getById(
        id: string,
    ) {

        const share =
            await adminShareRepository.findById(
                db,
                id,
            );

        if (!share) {
            throw new ShareNotFoundError();
        }

        return share;
    }


    /**
     * Create a share.
     *
     * ADMIN ONLY
     */
    async create(
        adminId: string,
        dto: CreateAdminShareDto,
    ) {

        return withTransaction(
            async (tx) => {

                const name =
                    shareValidation.validateName(
                        dto.name,
                    );


                const existing =
                    await adminShareRepository.findByName(
                        tx,
                        name,
                    );


                if (existing) {
                    throw new DuplicateShareNameError();
                }

                const logo = dto.logo?.trim() ||null;
                const logoPublicId = dto.logoPublicId?.trim() || null;

                const description =
                    shareValidation.validateDescription(
                        dto.description,
                    );


                const percentage =
                    shareValidation.validatePercentage(
                        dto.dailyReturnPercentage,
                    );


                const cycleDays =
                    shareValidation.validateCycle(
                        dto.cycleDays,
                    );


                const status = ShareStatus.STARTED;

                return adminShareRepository.create(
                    tx,
                    {
                        createdBy: adminId,
                        name,
                        logo,
                        logoPublicId,
                        description,
                        dailyReturnPercentage: percentage.toFixed(4),
                        cycleDays,
                        status,
                    },
                );
            },
        );
    }


    /**
     * Update share information.
     *
     * ADMIN ONLY
     */
    async update(
    id: string,
    dto: UpdateAdminShareDto,
) {

    return withTransaction(
        async (tx) => {

            const share =
                await adminShareRepository.findById(
                    tx,
                    id,
                );


            if (!share) {
                throw new ShareNotFoundError();
            }


            /**
             * Share information and financial terms
             * can only be modified while the share
             * is still in STARTED state.
             */
            if (
                share.status !==
                ShareStatus.STARTED
            ) {
                throw new ShareModificationNotAllowedError();
            }


            const updateData:
                Partial<
                    typeof shares.$inferInsert
                > = {};


            /**
             * Update name.
             */
            if (
                dto.name !== undefined
            ) {

                const name =
                    shareValidation.validateName(
                        dto.name,
                    );


                if (
                    name !== share.name
                ) {

                    const existing =
                        await adminShareRepository.findByName(
                            tx,
                            name,
                        );


                    if (
                        existing &&
                        existing.id !== id
                    ) {
                        throw new DuplicateShareNameError();
                    }
                }


                updateData.name =
                    name;
            }


            /**
             * Update logo.
             *
             * logo and logoPublicId belong to
             * the same uploaded Cloudinary asset.
             *
             * If either one is supplied, update
             * both together.
             */
            if (
                dto.logo !== undefined ||
                dto.logoPublicId !== undefined
            ) {

                updateData.logo =
                    dto.logo?.trim() || null;

                updateData.logoPublicId =
                    dto.logoPublicId?.trim() || null;
            }


            /**
             * Update description.
             */
            if (
                dto.description !== undefined
            ) {

                updateData.description =
                    shareValidation.validateDescription(
                        dto.description,
                    );
            }


            /**
             * Update daily return percentage.
             */
            if (
                dto.dailyReturnPercentage !==
                undefined
            ) {

                updateData.dailyReturnPercentage =
                    shareValidation
                        .validatePercentage(
                            dto.dailyReturnPercentage,
                        )
                        .toFixed(4);
            }


            /**
             * Update cycle duration.
             */
            if (
                dto.cycleDays !==
                undefined
            ) {

                updateData.cycleDays =
                    shareValidation.validateCycle(
                        dto.cycleDays,
                    );
            }


            /**
             * Nothing to update.
             */
            if (
                Object.keys(
                    updateData,
                ).length === 0
            ) {
                return share;
            }


            return adminShareRepository.update(
                tx,
                id,
                updateData,
            );
        },
    );
}


    /**
     * Start / reopen a share.
     *
     * ADMIN ONLY
     *
     * Allowed transitions:
     *
     * STARTED    → IN_PROGRESS
     * CLOSED     → IN_PROGRESS
     *
     * IN_PROGRESS cannot be started again.
     */
    async start(
        id: string,
    ) {
        return withTransaction(
            async (tx) => {

                const share =
                    await adminShareRepository.findById(
                        tx,
                        id,
                    );

                if (!share) {
                    throw new ShareNotFoundError();
                }


                /**
                 * Already active.
                 *
                 * IN_PROGRESS → IN_PROGRESS
                 * is not a valid lifecycle transition.
                 */
                if (
                    share.status ===
                    ShareStatus.IN_PROGRESS
                ) {
                    throw new ShareAlreadyInProgressError();
                }


                /**
                 * Only STARTED and CLOSED
                 * shares can become active.
                 *
                 * STARTED → IN_PROGRESS
                 * CLOSED  → IN_PROGRESS
                 */
                if (
                    share.status !== ShareStatus.STARTED &&
                    share.status !== ShareStatus.CLOSED
                ) {
                    throw new ShareModificationNotAllowedError();
                }


                const updatedShare =
                    await adminShareRepository.updateStatus(
                        tx,
                        id,
                        ShareStatus.IN_PROGRESS,
                        {
                            /**
                             * Keep the original start time
                             * if the share was already started
                             * before.
                             *
                             * For a newly created share,
                             * this becomes now.
                             */
                            startedAt:
                                share.startedAt ??
                                new Date(),

                            /**
                             * A reopened share is active again,
                             * so there is no current closedAt.
                             */
                            closedAt: null,
                        },
                    );


                if (!updatedShare) {
                    throw new ShareModificationNotAllowedError();
                }


                return updatedShare;
            },
        );
    }


    /**
     * Close a share.
     *
     * ADMIN ONLY
     *
     * Allowed transition:
     *
     * IN_PROGRESS → CLOSED
     *
     * STARTED shares cannot be closed directly.
     */
    async close(
        id: string,
    ) {
        return withTransaction(
            async (tx) => {

                const share =
                    await adminShareRepository.findById(
                        tx,
                        id,
                    );


                if (!share) {
                    throw new ShareNotFoundError();
                }


                /**
                 * Already closed.
                 */
                if (
                    share.status ===
                    ShareStatus.CLOSED
                ) {
                    throw new ShareAlreadyClosedError();
                }


                /**
                 * Only active shares
                 * can be closed.
                 */
                if (
                    share.status !==
                    ShareStatus.IN_PROGRESS
                ) {
                    throw new ShareModificationNotAllowedError();
                }


                const updatedShare =
                    await adminShareRepository.updateStatus(
                        tx,
                        id,
                        ShareStatus.CLOSED,
                        {
                            closedAt:
                                new Date(),
                        },
                    );


                if (!updatedShare) {
                    throw new ShareModificationNotAllowedError();
                }


                return updatedShare;
            },
        );
    }

    /**
     * Delete a share.
     *
     * ADMIN ONLY
     *
     * A share can only be deleted when:
     *
     * 1. It exists.
     * 2. It has never entered the investment lifecycle.
     * 3. It has no purchase history.
     */
    async delete(
        id: string,
    ) {

        return withTransaction(
            async (tx) => {

                /**
                 * 1. Verify share exists.
                 */
                const share =
                    await adminShareRepository.findById(
                        tx,
                        id,
                    );


                if (!share) {
                    throw new ShareNotFoundError();
                }


                /**
                 * 2. Only STARTED shares can
                 * be deleted.
                 *
                 * Once a share becomes
                 * IN_PROGRESS or CLOSED,
                 * its lifecycle/history must
                 * be preserved.
                 */
                if (
                    share.status !==
                    ShareStatus.STARTED
                ) {

                    throw new ShareModificationNotAllowedError();
                }


                /**
                 * 3. Check purchase history.
                 *
                 * A share with even one purchase
                 * must never be physically deleted.
                 */
                const hasPurchases =
                    await adminShareRepository.hasPurchases(
                        tx,
                        id,
                    );


                if (hasPurchases) {

                    throw new ShareHasPurchaseHistoryError();
                }


                /**
                 * 4. Safe to delete.
                 */
                const deletedShare =
                    await adminShareRepository.delete(
                        tx,
                        id,
                    );


                if (!deletedShare) {
                    throw new ShareNotFoundError();
                }


                return deletedShare;
            },
        );
    }
}


export const adminShareService =
    new AdminShareService();