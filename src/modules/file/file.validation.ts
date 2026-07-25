import { InvalidFileError } from "./file.errors";

export class FileValidation {

    // Maximum upload size (5 MB).
    static readonly MAX_FILE_SIZE =
        5 * 1024 * 1024;

    // Allowed MIME types.
    static readonly ALLOWED_MIME_TYPES = [

        // Images
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",

        // Documents
        "application/pdf",

    ] as const;

    // Ensure a file was uploaded.
    ensureFileExists(
        file?: Express.Multer.File,
    ) {
        if (!file) {
            throw new InvalidFileError(
                "No file uploaded.",
            );
        }

        return file;
    }

    // Validate file size.
    validateFileSize(
        size: number,
    ) {
        if (
            size >
            FileValidation.MAX_FILE_SIZE
        ) {
            throw new InvalidFileError(
                "File size cannot exceed 5 MB.",
            );
        }

        return size;
    }

    // Validate MIME type.
    validateMimeType(
        mimeType: string,
    ) {
        if (
            !FileValidation.ALLOWED_MIME_TYPES.includes(
                mimeType as (typeof FileValidation.ALLOWED_MIME_TYPES)[number],
            )
        ) {
            throw new InvalidFileError(
                "Only JPG, JPEG, PNG, WEBP and PDF files are allowed.",
            );
        }

        return mimeType;
    }

    // Ensure uploaded file is an image.
    ensureImage(
        mimeType: string,
    ) {
        if (
            !mimeType.startsWith(
                "image/",
            )
        ) {
            throw new InvalidFileError(
                "Only image files are allowed.",
            );
        }

        return mimeType;
    }

    // Ensure uploaded file is a PDF.
    ensurePdf(
        mimeType: string,
    ) {
        if (
            mimeType !==
            "application/pdf"
        ) {
            throw new InvalidFileError(
                "Only PDF files are allowed.",
            );
        }

        return mimeType;
    }
}

export const fileValidation =
    new FileValidation();