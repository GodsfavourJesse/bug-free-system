import { env } from "@/config";
import { v2 as cloudinary } from "cloudinary";


// Configure Cloudinary.
cloudinary.config({

    cloud_name:
        env.cloudinary.cloudName,

    api_key:
        env.cloudinary.apiKey,

    api_secret:
        env.cloudinary.apiSecret,
});

// Export configured instance.
export { cloudinary };