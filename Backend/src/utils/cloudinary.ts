import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadBuffer = (
  buffer: Buffer,
  options: { folder?: string; resource_type?: string } = {},
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const opts: any = {
      folder: options.folder || "chatbuddy_posts",
      resource_type: options.resource_type || "auto",
    };
    const uploadStream = cloudinary.uploader.upload_stream(
      opts,
      (error: any, result: any) => {
        if (error) return reject(error);
        resolve(result.secure_url as string);
      },
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};
