import { Request, Response } from "express";

import { fileService } from "./file.service";
import { fileValidation } from "./file.validation";
import { UploadFolders } from "./fileDto";

/**
 * File Controller
 *
 * Handles file upload and deletion.
 * Business logic belongs to the service layer.
 */
export class FileController {

    // Upload a file.
    async upload(
        req: Request,
        res: Response,
    ) {

        const file = fileValidation.ensureFileExists(
            req.file,
        );

        const result = await fileService.uploadFile(
            file,
            UploadFolders.PAYMENT_PROOFS,
        );

        return res.status(201).json({
            success: true,
            message: "File uploaded successfully.",
            data: result,
        });
    }

    // Delete a previously uploaded file.
    async delete(
        req: Request,
        res: Response,
    ) {

        const {
            publicId,
            resourceType,
        } = req.body;

        await fileService.deleteFile(
            publicId,
            resourceType,
        );

        return res.json({
            success: true,
            message: "File deleted successfully.",
        });
    }
}

export const fileController = new FileController();