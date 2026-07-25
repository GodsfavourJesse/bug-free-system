import { Request, Response } from "express";

import {
    adminUserProfileService,
} from "./admin-user-profile.service";

export class AdminUserProfileController {

    // Return a complete user profile.
    async getUserProfile(
        req: Request,
        res: Response,
    ) {

        const userId = Array.isArray(
            req.params.id,
        )
            ? req.params.id[0]
            : req.params.id;

        const profile = await adminUserProfileService.getUserProfile(
            {
                userId,
            },
        );

        return res.status(200).json({
            success: true,
            data: profile,
        });
    }

}

export const adminUserProfileController = new AdminUserProfileController();