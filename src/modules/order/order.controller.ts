import { Request, Response } from "express";

import { orderService } from "./order.service";

export class OrderController {

    // Get today's order together with its tasks.
    async getTodayOrder(
        req:Request,
        res:Response,
    ){
        const userId = req.user?.id;

        if(!userId){
            throw new Error(
                "Unauthorized"
            );
        }

        const order = await orderService.getTodayOrder(
            userId,
        );

        res.status(200).json({
            success:true,
            data:order,
        });
    }

    // Get one daily order.
    async getOrder(
        req: Request,
        res: Response,
    ) {
        const orderId = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;

        const order =
            await orderService.getOrderById(
                orderId,
            );

        return res.status(200).json({
            success: true,
            data: order,
        });
    }

    // Get today's tasks only.
    async getTodayOrderItems(
        req: Request,
        res: Response,
    ) {
        const items =
            await orderService.getOrderItems(
                req.user!.id,
            );

        return res.status(200).json({
            success: true,
            data: items,
        });
    }

    // Complete one task.
    async completeOrderItem(
        req: Request,
        res: Response,
    ) {
        const itemId = Array.isArray(req.params.itemId)
            ? req.params.itemId[0]
            : req.params.itemId;

        const result =
            await orderService.completeOrderItem({
                userId: req.user!.id,
                itemId,
            });

        return res.status(200).json({
            success: true,
            message: "Task completed successfully.",
            data: result,
        });
    }

    // Get one task.
    async getOrderItem(
        req: Request,
        res: Response,
    ) {
        const itemId = Array.isArray(req.params.itemId)
            ? req.params.itemId[0]
            : req.params.itemId;

        const item =
            await orderService.getOrderItem(
                itemId,
            );

        return res.status(200).json({
            success: true,
            data: item,
        });
    }
}

export const orderController =
    new OrderController();