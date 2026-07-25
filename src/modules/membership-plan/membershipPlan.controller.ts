import { NextFunction, Request, Response } from "express";

import { membershipPlanService } from "./membershipPlan.service";

export class MembershipPlanController {

    // Returns every membership plan.
    async getPlans(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const plans =
                await membershipPlanService.getPlans();

            res.status(200).json({
                success: true,
                data: plans,
            });

        } catch (error) {
            next(error);
        }
    }

    // Returns a membership plan by ID.
    async getPlan(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const id = String(
                req.params.id,
            );

            const plan =
                await membershipPlanService.getPlan(
                    id,
                );

            res.status(200).json({
                success: true,
                data: plan,
            });

        } catch (error) {
            next(error);
        }
    }

    // Returns a membership plan by slug.
    async getPlanBySlug(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const slug = String(
                req.params.slug,
            );

            const plan =
                await membershipPlanService.getPlanBySlug(
                    slug,
                );

            res.status(200).json({
                success: true,
                data: plan,
            });

        } catch (error) {
            next(error);
        }
    }

    // Returns the authenticated user's current membership plan.
    async getCurrentPlan(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const plan =
                await membershipPlanService.getCurrentPlan(
                    req.user.id,
                );

            res.status(200).json({
                success: true,
                data: plan,
            });

        } catch (error) {
            next(error);
        }
    }

    // Returns the next available membership plan.
    async getNextPlan(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const plan =
                await membershipPlanService.getNextPlan(
                    req.user.id,
                );

            res.status(200).json({
                success: true,
                data: plan,
            });

        } catch (error) {
            next(error);
        }
    }
}

export const membershipPlanController =
    new MembershipPlanController();