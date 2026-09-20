import cloudinary from "../config/cloudinary.js";

/*
|--------------------------------------------------------------------------
| UPLOAD PROFILE IMAGE
|--------------------------------------------------------------------------
*/

export const uploadProfileImage = (
  buffer,
  userId
) => {
  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder:
            "urbanthread/profile-images",
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

/*
|--------------------------------------------------------------------------
| UPLOAD PRODUCT IMAGE
|--------------------------------------------------------------------------
*/

export const uploadProductImage = (
  buffer
) => {
  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder: "urbanthread/products",
          resource_type: "image",

          // Cloudinary transformation
          // for consistent product images.
          transformation: [
            {
              width: 1200,
              height: 1500,
              crop: "fill",
              gravity: "auto",
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              publicId:
                result.public_id,
            });
          }
        }
      );

    uploadStream.end(buffer);
  });
};

/*
|--------------------------------------------------------------------------
| DELETE PRODUCT IMAGE
|--------------------------------------------------------------------------
*/

export const deleteProductImage =
  async (publicId) => {
    if (!publicId) {
      throw new Error(
        "Product image public ID is required"
      );
    }

    return await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: "image",
      }
    );
  };