// Supported upload folders.
//
// Each folder represents a different
// type of uploaded file.
export const UploadFolders = {

    // Upgrade module
    PAYMENT_PROOFS: "payment-proofs",

    // Withdrawal module
    RECEIPTS: "receipts",

    // User module
    AVATARS: "avatars",

    // Admin module
    ADVERTISEMENTS: "advertisements",

    // Membership module
    MEMBERSHIP: "membership",

    // Verification module
    KYC: "kyc",

    // Share module
    SHARES: "shares",

    // General documents
    DOCUMENTS: "documents",
} as const;

export type UploadFolder = 
    (typeof UploadFolders)[keyof typeof UploadFolders];

// Data returned after a successful upload.
export interface UploadedFileDto {
    // Cloudinary public ID.
    publicId: string;

    // Secure Cloudinary URL.
    url: string;

    // Original filename.
    originalName: string;

    // MIME type.
    mimeType: string;

    // File size in bytes.
    size: number;

    // Image format or PDF extension.
    format: string;

    // Image width (undefined for PDFs).
    width?: number;

    // Image height (undefined for PDFs).
    height?: number;

    // Cloudinary folder.
    folder: UploadFolder;
}