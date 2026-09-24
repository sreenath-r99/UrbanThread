import mongoose from "mongoose";

import Rating from "../models/Rating.js";
import Product from "../models/Product.js";

/*
|----------------------------------------------------------------------
| VALIDATE RATING
|----------------------------------------------------------------------
*/

const validateRating = (rating) => {
  const numericRating = Number(rating);

  if (!Number.isInteger(numericRating)) {
    throw new Error("Rating must be a whole number from 1 to 5");
  }

  if (numericRating < 1 || numericRating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  return numericRating;
};

/*
|----------------------------------------------------------------------
| GET PRODUCT RATING
|----------------------------------------------------------------------
*/

export const getProductRating = async (productId, userId = null) => {
  /*
    |------------------------------------------------------------------
    | VALIDATE PRODUCT ID
    |------------------------------------------------------------------
    */

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID");
  }

  /*
    |------------------------------------------------------------------
    | CHECK PRODUCT
    |------------------------------------------------------------------
    */

  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
    isActive: true,
  }).select("_id");

  if (!product) {
    const error = new Error("Product not found or unavailable");

    error.statusCode = 404;

    throw error;
  }

  /*
    |------------------------------------------------------------------
    | CALCULATE AVERAGE AND COUNT
    |------------------------------------------------------------------
    */

  const result = await Rating.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
      },
    },

    {
      $group: {
        _id: "$product",

        averageRating: {
          $avg: "$rating",
        },

        totalRatings: {
          $sum: 1,
        },
      },
    },
  ]);

  /*
    |------------------------------------------------------------------
    | DEFAULT VALUES
    |------------------------------------------------------------------
    */

  let averageRating = 0;
  let totalRatings = 0;

  if (result.length > 0) {
    averageRating = Number(result[0].averageRating);

    totalRatings = result[0].totalRatings;
  }

  /*
    |------------------------------------------------------------------
    | ROUND AVERAGE
    |------------------------------------------------------------------
    */

  averageRating = Number(averageRating.toFixed(1));

  /*
    |------------------------------------------------------------------
    | GET CURRENT USER'S RATING
    |------------------------------------------------------------------
    */

  let userRating = null;

  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    const existingRating = await Rating.findOne({
      user: userId,
      product: productId,
    }).select("rating");

    if (existingRating) {
      userRating = existingRating.rating;
    }
  }

  /*
    |------------------------------------------------------------------
    | RETURN RESULT
    |------------------------------------------------------------------
    */

  return {
    productId,

    averageRating,

    totalRatings,

    userRating,
  };
};

/*
|----------------------------------------------------------------------
| SAVE PRODUCT RATING
|----------------------------------------------------------------------
*/

export const saveProductRating = async (userId, productId, rating) => {
  /*
    |------------------------------------------------------------------
    | VALIDATE USER ID
    |------------------------------------------------------------------
    */

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  /*
    |------------------------------------------------------------------
    | VALIDATE PRODUCT ID
    |------------------------------------------------------------------
    */

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID");
  }

  /*
    |------------------------------------------------------------------
    | VALIDATE RATING
    |------------------------------------------------------------------
    */

  const numericRating = validateRating(rating);

  /*
    |------------------------------------------------------------------
    | CHECK PRODUCT
    |------------------------------------------------------------------
    */

  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
    isActive: true,
  }).select("_id");

  if (!product) {
    const error = new Error("Product not found or unavailable");

    error.statusCode = 404;

    throw error;
  }

  /*
    |------------------------------------------------------------------
    | CREATE OR UPDATE RATING
    |------------------------------------------------------------------
    */

  const savedRating = await Rating.findOneAndUpdate(
    {
      user: userId,
      product: productId,
    },

    {
      $set: {
        rating: numericRating,
      },
    },

    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  /*
    |------------------------------------------------------------------
    | GET UPDATED SUMMARY
    |------------------------------------------------------------------
    */

  const summary = await getProductRating(productId, userId);

  /*
    |------------------------------------------------------------------
    | RETURN RESULT
    |------------------------------------------------------------------
    */

  return {
    rating: savedRating.rating,

    averageRating: summary.averageRating,

    totalRatings: summary.totalRatings,

    userRating: summary.userRating,
  };
};
