import express from "express";

import {
  getProductReviewsController,
  createProductReviewController,
  updateProductReviewController,
  deleteProductReviewController,
} from "../controllers/reviewController.js";

import protectCart from "../middleware/cartAuthMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET PRODUCT REVIEWS
|--------------------------------------------------------------------------
|
| Public
|
| GET /api/reviews/:productId
|
|--------------------------------------------------------------------------
*/

router.get("/:productId", getProductReviewsController);

/*
|--------------------------------------------------------------------------
| CREATE PRODUCT REVIEW
|--------------------------------------------------------------------------
|
| POST /api/reviews/:productId
|
|--------------------------------------------------------------------------
*/

router.post("/:productId", protectCart, createProductReviewController);

/*
|--------------------------------------------------------------------------
| UPDATE PRODUCT REVIEW
|--------------------------------------------------------------------------
|
| PATCH /api/reviews/:reviewId
|
|--------------------------------------------------------------------------
*/

router.patch("/:reviewId", protectCart, updateProductReviewController);

/*
|--------------------------------------------------------------------------
| DELETE PRODUCT REVIEW
|--------------------------------------------------------------------------
|
| DELETE /api/reviews/:reviewId
|
|--------------------------------------------------------------------------
*/

router.delete("/:reviewId", protectCart, deleteProductReviewController);

export default router;
