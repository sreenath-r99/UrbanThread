import {
  uploadProductImage,
  deleteProductImage,
} from "../services/cloudinaryService.js";

/*
|--------------------------------------------------------------------------
| UPLOAD PRODUCT IMAGES
|--------------------------------------------------------------------------
*/

const uploadImages = async (
  req,
  res
) => {
  try {
    if (
      !req.files ||
      req.files.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one product image is required",
      });
    }

    if (req.files.length > 5) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum 5 product images are allowed",
      });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const result =
        await uploadProductImage(
          file.buffer
        );

      uploadedImages.push({
        url: result.url,
        publicId:
          result.publicId,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Product images uploaded successfully",
      images: uploadedImages,
    });
  } catch (error) {
    console.error(
      "PRODUCT IMAGE UPLOAD ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to upload product images",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE PRODUCT IMAGE
|--------------------------------------------------------------------------
*/

const deleteImage = async (
  req,
  res
) => {
  try {
    const { publicId } =
      req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message:
          "Product image public ID is required",
      });
    }

    const result =
      await deleteProductImage(
        publicId
      );

    return res.status(200).json({
      success: true,
      message:
        "Product image deleted successfully",
      result,
    });
  } catch (error) {
    console.error(
      "PRODUCT IMAGE DELETE ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to delete product image",
    });
  }
};

export {
  uploadImages,
  deleteImage,
};