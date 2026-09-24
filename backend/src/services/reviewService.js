import mongoose from "mongoose";

import Review from "../models/Review.js";
import Product from "../models/Product.js";

/*
|--------------------------------------------------------------------------
| VALIDATE REVIEW TEXT
|--------------------------------------------------------------------------
*/

const validateComment = (comment) => {
  if (typeof comment !== "string") {
    throw new Error("Review must be a string");
  }

  const trimmedComment = comment.trim();

  if (trimmedComment.length < 3) {
    throw new Error("Review must contain at least 3 characters");
  }

  if (trimmedComment.length > 1000) {
    throw new Error("Review cannot exceed 1000 characters");
  }

  return trimmedComment;
};

/*
|--------------------------------------------------------------------------
| VALIDATE PRODUCT
|--------------------------------------------------------------------------
*/

const validateProduct = async (productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID");
  }

  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
    isActive: true,
  });

  if (!product) {
    throw new Error("Product not found or unavailable");
  }

  return product;
};

/*
|--------------------------------------------------------------------------
| GET PRODUCT REVIEWS
|--------------------------------------------------------------------------
|
| USER SIDE
|
|--------------------------------------------------------------------------
*/

export const getProductReviews = async (productId) => {
  await validateProduct(productId);

  const reviews = await Review.find({
    product: productId,
  })
    .populate("user", "name email")
    .populate("product", "name images")
    .sort({
      createdAt: -1,
    });

  return reviews;
};

/*
|--------------------------------------------------------------------------
| CREATE PRODUCT REVIEW
|--------------------------------------------------------------------------
|
| USER SIDE
|
|--------------------------------------------------------------------------
*/

export const createProductReview = async ({ userId, productId, comment }) => {
  await validateProduct(productId);

  const validatedComment = validateComment(comment);

  const existingReview = await Review.findOne({
    user: userId,
    product: productId,
  });

  if (existingReview) {
    throw new Error("You have already reviewed this product");
  }

  const review = await Review.create({
    user: userId,
    product: productId,
    comment: validatedComment,
  });

  return await Review.findById(review._id)
    .populate("user", "name email")
    .populate("product", "name images");
};

/*
|--------------------------------------------------------------------------
| UPDATE PRODUCT REVIEW
|--------------------------------------------------------------------------
|
| USER SIDE
|
|--------------------------------------------------------------------------
*/

export const updateProductReview = async ({ userId, reviewId, comment }) => {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new Error("Invalid review ID");
  }

  const validatedComment = validateComment(comment);

  const review = await Review.findOne({
    _id: reviewId,
    user: userId,
  });

  if (!review) {
    throw new Error("Review not found or you are not allowed to update it");
  }

  review.comment = validatedComment;

  await review.save();

  return await Review.findById(review._id)
    .populate("user", "name email")
    .populate("product", "name images");
};

/*
|--------------------------------------------------------------------------
| DELETE PRODUCT REVIEW
|--------------------------------------------------------------------------
|
| USER SIDE
|--------------------------------------------------------------------------
*/

export const deleteProductReview = async ({ userId, reviewId }) => {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new Error("Invalid review ID");
  }

  const review = await Review.findOne({
    _id: reviewId,
    user: userId,
  });

  if (!review) {
    throw new Error("Review not found or you are not allowed to delete it");
  }

  await Review.deleteOne({
    _id: reviewId,
  });

  return review;
};

/*
|--------------------------------------------------------------------------
| GET ALL REVIEWS - ADMIN
|--------------------------------------------------------------------------
|
| Requirements:
|
| - All reviews
| - Newest reviews first
| - Pagination
| - Optional search
| - User information
| - Product information
|
|--------------------------------------------------------------------------
*/

export const getAllReviews = async ({
  search = "",
  page = 1,
  limit = 10,
} = {}) => {
  const safePage = Math.max(Number(page) || 1, 1);

  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const skip = (safePage - 1) * safeLimit;

  const trimmedSearch = String(search || "").trim();

  let matchingUserIds = [];

  if (trimmedSearch) {
    const User = mongoose.model("User");

    const users = await User.find({
      $or: [
        {
          name: {
            $regex: trimmedSearch,
            $options: "i",
          },
        },
        {
          email: {
            $regex: trimmedSearch,
            $options: "i",
          },
        },
      ],
    }).select("_id");

    matchingUserIds = users.map((user) => user._id);
  }

  const filter = {};

  if (trimmedSearch) {
    filter.$or = [
      {
        comment: {
          $regex: trimmedSearch,
          $options: "i",
        },
      },
    ];

    if (matchingUserIds.length > 0) {
      filter.$or.push({
        user: {
          $in: matchingUserIds,
        },
      });
    }

    /*
     * Product search is handled below by looking up
     * matching product IDs.
     */
    const products = await Product.find({
      name: {
        $regex: trimmedSearch,
        $options: "i",
      },
      isDeleted: false,
    }).select("_id");

    if (products.length > 0) {
      filter.$or.push({
        product: {
          $in: products.map((product) => product._id),
        },
      });
    }
  }

  const [reviews, totalReviews] = await Promise.all([
    Review.find(filter)
      .populate("user", "name email")
      .populate("product", "name images")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(safeLimit)
      .lean(),

    Review.countDocuments(filter),
  ]);

  return {
    reviews,

    pagination: {
      currentPage: safePage,

      totalPages: Math.ceil(totalReviews / safeLimit),

      totalReviews,

      limit: safeLimit,
    },
  };
};

/*
|--------------------------------------------------------------------------
| DELETE REVIEW - ADMIN
|--------------------------------------------------------------------------
*/

export const deleteReviewByAdmin = async (reviewId) => {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new Error("Invalid review ID");
  }

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new Error("Review not found");
  }

  await Review.deleteOne({
    _id: reviewId,
  });

  return review;
};
