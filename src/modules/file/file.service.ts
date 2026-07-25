import fs from "fs/promises";
import { fileValidation } from "./file.validation";
import { UploadedFileDto, UploadFolder, UploadFolders } from "./fileDto";
import { cloudinary } from "./providers/cloudinary";

export class FileService {

    // Upload an image or PDF to Cloudinary.
    async uploadFile(
        file: Express.Multer.File,
        folder: UploadFolder,
    ): Promise<UploadedFileDto> {

        // Ensure file exists.
        fileValidation.ensureFileExists(file);

        // Validate size.
        fileValidation.validateFileSize(file.size);

        // Validate MIME type.
        fileValidation.validateMimeType(file.mimetype);

        try {
            // Upload to Cloudinary.
            const result = await cloudinary.uploader.upload(
                file.path,
                {
                    folder,
                    resource_type: "auto",
                },
            );
    
            return {
                publicId: result.public_id,
                url: result.secure_url,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: result.bytes,
                format: result.format,
                width: result.width,
                height: result.height,
                folder,
            };
        } finally {
            // Remove temporary local file.
            await fs.unlink(file.path).catch(() => {});
        }
    }

    // Delete an uploaded file.
    async deleteFile(
        publicId: string,
        resourceType: "image" | "raw" = "image",
    ) {
        if (!publicId) {
            return;
        }

        await cloudinary.uploader.destroy(
            publicId,
            {
                resource_type: resourceType,
            },
        );
    }

    // Extract Cloudinary public ID from a URL.
    extractPublicId(
        url: string,
    ) {

        if (!url) {
            return "";
        }

        const parts = url.split("/");

        const uploadIndex = parts.findIndex(
            (part) =>
                part === "upload",
        );

        if (
            uploadIndex === -1
        ) {
            return "";
        }

        const publicId = parts
            .slice(
                uploadIndex + 2,
            )
            .join("/")
            .replace(
                /\.[^/.]+$/,
                "",
            );

        return publicId;
    }
}

export const fileService =
    new FileService();