import {
    Request,
    Response,
    NextFunction,
} from "express";
import { CreateAdminShareDto, UpdateAdminShareDto } from "./adminShare.dto";
import { adminShareService } from "./adminShare.service";
import { ShareStatus } from "../../../database/enums/share.enum";

interface ShareIdParams {
    id: string;
}

interface ShareQuery {
    page?: string;
    limit?: string;
    status?: string;
    search?: string;
}

export class AdminShareController {

    /**
     * GET /admin/shares
     *
     * Admin share management list.
     *
     * ADMIN ONLY
     */
    async getShares(
        req: Request<
            {},
            {},
            {},
            ShareQuery
        >,
        res: Response,
        next: NextFunction,
    ) {
        try {

            const page =
                Number(
                    req.query.page ?? 1,
                );


            const limit =
                Number(
                    req.query.limit ?? 20,
                );


            const rawStatus =
                req.query.status?.trim();

            let status: ShareStatus | undefined;

            if (rawStatus) {

                if (
                    !Object.values(ShareStatus).includes(
                        rawStatus as ShareStatus,
                    )
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid share status.",
                    });
                }

                status =
                    rawStatus as ShareStatus;
            }

            const search =
                req.query.search?.trim();

            const result =
                await adminShareService.getShares(
                    page,
                    limit,
                    {
                        status,
                        search,
                    },
                );


            return res.status(200).json({

                success: true,

                ...result,

            });

        } catch (error) {

            next(error);

        }
    }

    /**
     * GET /admin/shares/:id
     *
     * Get a single admin share.
     *
     * ADMIN ONLY
     */
    async getById(
        req: Request<ShareIdParams>,
        res: Response,
        next: NextFunction,
    ) {
        try {

            const share =
                await adminShareService.getById(
                    req.params.id,
                );

            return res.status(200).json({
                success: true,
                data: share,
            });

        } catch (error) {
            next(error);
        }
    }


    /**
     * POST /admin/shares
     *
     * Admin creates share.
     */
    async create(
        req: Request<
            {},
            {},
            CreateAdminShareDto
        >,
        res: Response,
        next: NextFunction,
    ) {
        try {

            const share =
                await adminShareService.create(
                    req.user!.id,
                    req.body,
                );

            return res.status(201).json({
                success: true,
                message:
                    "Share created successfully.",
                data: share,
            });

        } catch (error) {
            next(error);
        }
    }


    /**
     * PATCH /admin/shares/:id
     *
     * Admin updates share.
     */
    async update(
        req: Request<
            ShareIdParams,
            {},
            UpdateAdminShareDto
        >,
        res: Response,
        next: NextFunction,
    ) {
        try {

            const share =
                await adminShareService.update(
                    req.params.id,
                    req.body,
                );

            return res.status(200).json({
                success: true,
                message:
                    "Share updated successfully.",
                data: share,
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /admin/shares/:id
     *
     * Admin deletes a share.
     */
    async delete(
        req: Request<ShareIdParams>,
        res: Response,
        next: NextFunction,
    ) {
        try {

            const share =
                await adminShareService.delete(
                    req.params.id,
                );


            return res.status(200).json({
                success: true,
                message:
                    "Share deleted successfully.",
                data: share,
            });

        } catch (error) {
            next(error);
        }
    }


    /**
     * POST /admin/shares/:id/start
     *
     * Admin starts a share.
     */
    async start(
        req: Request<ShareIdParams>,
        res: Response,
        next: NextFunction,
    ) {
        try {

            const share =
                await adminShareService.start(
                    req.params.id,
                );

            return res.status(200).json({
                success: true,
                message:
                    "Share started successfully.",
                data: share,
            });

        } catch (error) {
            next(error);
        }
    }


    /**
     * POST /admin/shares/:id/close
     *
     * Admin closes a share.
     */
    async close(
        req: Request<ShareIdParams>,
        res: Response,
        next: NextFunction,
    ) {
        try {

            const share =
                await adminShareService.close(
                    req.params.id,
                );

            return res.status(200).json({
                success: true,
                message:
                    "Share closed successfully.",
                data: share,
            });

        } catch (error) {
            next(error);
        }
    }
}


export const adminShareController =
    new AdminShareController();