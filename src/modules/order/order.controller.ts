import { Request, Response } from "express";
import { orderService } from "./order.service";

export class OrderController {

    // Get today's daily tasks.
    async getTodayOrder(
        req: Request,
        res: Response,
    ) {
        const order =
            await orderService.getTodayOrder(
                req.user!.id,
            );

        return res.status(200).json({
            success: true,
            data: order,
        });
    }

    // Get one daily task group.
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

    // Get all tasks belonging
    // to one daily task group.
    async getOrderItems(
        req: Request,
        res: Response,
    ) {

        const orderId = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;

        const items =
            await orderService.getOrderItems(
                orderId,
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

        const result = await orderService.completeOrderItem({
            userId: req.user!.id,
            itemId,
        });

        return res.status(200).json({
            success: true,
            message:
                "Task completed successfully.",
            data: result,
        });
    }
}

export const orderController =
    new OrderController();