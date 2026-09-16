import cloudinary from "../config/cloudinary.js";

export const uploadProfileImage = (buffer, userId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "urbanthread/profile-images",
        public_id: `user-${userId}`,
        resource_type: "image",
        overwrite: true,
        invalidate: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
};