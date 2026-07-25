import { Request, Response } from "express";

import {
    adminUserService,
} from "./admin-user.service";

import {
    PaginationDto,
    SearchUsersDto,
    FilterUsersDto,
} from "./admin-user.dto";

export class AdminUserController {

    // Return every user.
    async getUsers(
        req: Request,
        res: Response,
    ) {

        const dto: PaginationDto = {
            page: req.query.page
                ? Number(req.query.page)
                : undefined,

            limit: req.query.limit
                ? Number(req.query.limit)
                : undefined,

            sortBy: req.query.sortBy as string,

            sortOrder: req.query.sortOrder as
                | "asc"
                | "desc"
                | undefined,
        };

        const users =
            await adminUserService.getUsers(
                dto,
            );

        return res.status(200).json({
            success: true,
            data: users,
        });
    }

    // Search users.
    async searchUsers(
        req: Request,
        res: Response,
    ) {

        const dto: SearchUsersDto = {
            query: String(
                req.query.query ?? "",
            ),

            page: req.query.page
                ? Number(req.query.page)
                : undefined,

            limit: req.query.limit
                ? Number(req.query.limit)
                : undefined,

            sortBy: req.query.sortBy as string,

            sortOrder: req.query.sortOrder as
                | "asc"
                | "desc"
                | undefined,
        };

        const users =
            await adminUserService.searchUsers(
                dto,
            );

        return res.status(200).json({
            success: true,
            data: users,
        });
    }

    // Filter users.
    async filterUsers(
        req: Request,
        res: Response,
    ) {

       const dto: FilterUsersDto = {
            membershipPlanId:
                req.query.membershipPlanId as string,

            isActive:
                req.query.isActive !== undefined
                    ? req.query.isActive === "true"
                    : undefined,

            isVerified:
                req.query.isVerified !== undefined
                    ? req.query.isVerified === "true"
                    : undefined,

            role:
                req.query.role as string,

            createdFrom:
                req.query.createdFrom
                    ? new Date(String(req.query.createdFrom))
                    : undefined,

            createdTo:
                req.query.createdTo
                    ? new Date(String(req.query.createdTo))
                    : undefined,

            page:
                req.query.page
                    ? Number(req.query.page)
                    : undefined,

            limit:
                req.query.limit
                    ? Number(req.query.limit)
                    : undefined,

            sortBy:
                req.query.sortBy as string,

            sortOrder:
                req.query.sortOrder as
                    | "asc"
                    | "desc"
                    | undefined,
        };  

        const users =
            await adminUserService.filterUsers(
                dto,
            );

        return res.status(200).json({
            success: true,
            data: users,
        });
    }

    // Suspend a user.
    async suspendUser(
        req: Request,
        res: Response,
    ) {

        const userId = String(req.params.id);

        const user =
            await adminUserService.suspendUser({
                userId,
            });

        return res.status(200).json({
            success: true,
            message:
                "User suspended successfully.",
            data: user,
        });
    }

    // Activate a user.
    async activateUser(
        req: Request,
        res: Response,
    ) {

        const userId = String(req.params.id);

        const user =
            await adminUserService.activateUser({
                userId,
            });

        return res.status(200).json({
            success: true,
            message:
                "User activated successfully.",
            data: user,
        });
    }

    // Verify a user.
    async verifyUser(
        req: Request,
        res: Response,
    ) {

        const userId = String(req.params.id);

        const user =
            await adminUserService.verifyUser({
                userId,
            });

        return res.status(200).json({
            success: true,
            message:
                "User verified successfully.",
            data: user,
        });
    }

    // View one user profile.
    async getUserProfile(
        req: Request<{ id: string }>,
        res: Response,
    ) {

        const profile =
            await adminUserService.getUserProfile({
                userId: req.params.id,
            });

        return res.status(200).json({
            success: true,
            data: profile,
        });
    }

}

export const adminUserController =
    new AdminUserController();