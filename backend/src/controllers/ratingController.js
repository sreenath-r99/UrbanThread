import * as ratingService from "../services/ratingService.js";

/*
|----------------------------------------------------------------------
| GET PRODUCT RATING
|----------------------------------------------------------------------
*/

export const getProductRatingController = async (req, res) => {
  try {
    const { productId } = req.params;

    /*
      |----------------------------------------------------------------
      | GET USER ID IF AUTHENTICATED
      |----------------------------------------------------------------
      */

    const userId = req.user?._id || req.user?.id || null;

    /*
      |----------------------------------------------------------------
      | GET RATING SUMMARY
      |----------------------------------------------------------------
      */

    const result = await ratingService.getProductRating(productId, userId);

    return res.status(200).json({
      success: true,

      message: "Product rating fetched successfully",

      ...result,
    });
  } catch (error) {
    console.error("GET PRODUCT RATING ERROR:", error);

    return res.status(error.statusCode || 400).json({
      success: false,

      message: error.message || "Unable to fetch product rating",
    });
  }
};

/*
|----------------------------------------------------------------------
| SAVE PRODUCT RATING
|----------------------------------------------------------------------
*/

export const saveProductRatingController = async (req, res) => {
  try {
    const { productId } = req.params;

    const { rating } = req.body;

    /*
      |----------------------------------------------------------------
      | USER MUST BE AUTHENTICATED
      |----------------------------------------------------------------
      */

    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,

        message: "Authentication required",
      });
    }

    /*
      |----------------------------------------------------------------
      | SAVE RATING
      |----------------------------------------------------------------
      */

    const result = await ratingService.saveProductRating(
      userId,
      productId,
      rating,
    );

    return res.status(200).json({
      success: true,

      message: "Rating saved successfully",

      ...result,
    });
  } catch (error) {
    console.error("SAVE PRODUCT RATING ERROR:", error);

    return res.status(error.statusCode || 400).json({
      success: false,

      message: error.message || "Unable to save product rating",
    });
  }
};
