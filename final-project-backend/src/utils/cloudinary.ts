import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Readable } from "stream";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary
 * @param fileBuffer The buffer of the file to upload
 * @param folder The folder in Cloudinary to upload to
 * @returns Promise that resolves to the Cloudinary UploadApiResponse
 */
export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string = "car-imports",
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary Upload Error:", error);
          reject(new Error("Failed to upload image to Cloudinary"));
        } else {
          resolve(result);
        }
      },
    );

    Readable.from(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Deletes a file from Cloudinary by its public ID
 * @param publicId The public ID of the resource
 */
export const deleteFromCloudinary = async (publicId: string): Promise<any> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    throw new Error("Failed to delete image from Cloudinary");
  }
};

/**
 * Fetches all images from a specific Cloudinary folder
 * @param folder The folder to fetch the images from
 */
export const getCloudinaryPhotos = async (
  folder: string = "final_project",
): Promise<any> => {
  try {
    const { resources } = await cloudinary.search
      .expression(`folder:${folder}`)
      .sort_by("created_at", "desc")
      .max_results(30)
      .execute();
    return resources;
  } catch (error) {
    console.error("Cloudinary Fetch Error:", error);
    throw new Error("Failed to fetch images from Cloudinary");
  }
};

export default cloudinary;
