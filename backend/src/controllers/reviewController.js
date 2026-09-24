import {
  getProductReviews,
  createProductReview,
  updateProductReview,
  deleteProductReview,
  getAllReviews,
  deleteReviewByAdmin,
} from "../services/reviewService.js";

/*
|--------------------------------------------------------------------------
| GET PRODUCT REVIEWS
|--------------------------------------------------------------------------
*/

export const getProductReviewsController = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await getProductReviews(productId);

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("GET PRODUCT REVIEWS ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to load reviews",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CREATE PRODUCT REVIEW
|--------------------------------------------------------------------------
*/

export const createProductReviewController = async (req, res) => {
  try {
    const { productId } = req.params;

    const { comment } = req.body;

    const review = await createProductReview({
      userId: req.user._id,

      productId,

      comment,
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error("CREATE REVIEW ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to create review",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE PRODUCT REVIEW
|--------------------------------------------------------------------------
*/

export const updateProductReviewController = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const { comment } = req.body;

    const review = await updateProductReview({
      userId: req.user._id,

      reviewId,

      comment,
    });

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error("UPDATE REVIEW ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to update review",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE PRODUCT REVIEW
|--------------------------------------------------------------------------
*/

export const deleteProductReviewController = async (req, res) => {
  try {
    const { reviewId } = req.params;

    await deleteProductReview({
      userId: req.user._id,

      reviewId,
    });

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("DELETE REVIEW ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to delete review",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL REVIEWS - ADMIN
|--------------------------------------------------------------------------
*/

export const getAllReviewsController = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const result = await getAllReviews({
      search,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,

      reviews: result.reviews,

      pagination: result.pagination,
    });
  } catch (error) {
    console.error("GET ALL REVIEWS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load reviews",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE REVIEW - ADMIN
|--------------------------------------------------------------------------
*/

export const deleteReviewByAdminController = async (req, res) => {
  try {
    const { reviewId } = req.params;

    await deleteReviewByAdmin(reviewId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("ADMIN DELETE REVIEW ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to delete review",
    });
  }
};
