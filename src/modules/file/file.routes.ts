import { Router } from "express";

import { authenticate } from "@/middlewares/auth.middleware";

import { fileController } from "./file.controller";
import { upload } from "./providers/multer";

const router = Router();

// All file routes require authentication.
router.use(authenticate);

// Upload a single file.
router.post(
    "/upload",
    upload.single("file"),
    fileController.upload.bind(
        fileController,
    ),
);

// Delete a file.
router.delete(
    "/",
    fileController.delete.bind(
        fileController,
    ),
);

export default router;