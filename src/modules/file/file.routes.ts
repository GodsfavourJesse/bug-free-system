import { Router } from "express";


import { fileController } from "./file.controller";
import { upload } from "./providers/multer";
import { authenticate } from "../../middlewares/auth.middleware";

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

// router.post(
//     "/share-logo",
//     upload.single("file"),
//     fileController.uploadShareLogo.bind(
//         fileController,
//     ),
// );

router.post(
    "/share-logo",
    upload.single("file"),
    (req, res, next) => {
        console.log("========== SHARE LOGO UPLOAD ==========");
        console.log("req.file:", req.file);
        console.log("req.body:", req.body);
        console.log("content-type:", req.headers["content-type"]);
        console.log("========================================");

        next();
    },
    fileController.uploadShareLogo.bind(
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