import multer from "multer";
import path from "path";
import fs from "fs";
import { FileValidation } from "../file.validation";

// Ensure uploads directory exists.
const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Store uploaded files temporarily on disk.
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir);
    },

    filename(req, file, cb) {
        const extension = path.extname(file.originalname);

        cb(
            null,
            `${Date.now()}-${Math.random()
                .toString(36)
                .substring(2)}${extension}`,
        );
    },
});

const allowedMimeTypes = [
    ...FileValidation.ALLOWED_MIME_TYPES,
];

const fileFilter: multer.Options["fileFilter"] = (
    req,
    file,
    callback,
) => {

    if (
        allowedMimeTypes.includes(
            file.mimetype as (typeof FileValidation.ALLOWED_MIME_TYPES)[number],
        )
    ) {
        return callback(null, true);
    }

    callback(
        new Error(
            "Only JPG, JPEG, PNG, WEBP and PDF files are allowed.",
        ),
    );
};

export const upload = multer({
    storage,

    fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});