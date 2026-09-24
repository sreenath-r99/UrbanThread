import express from "express";

import {
  getProductRatingController,
  saveProductRatingController,
} from "../controllers/ratingController.js";

import protectCart from "../middleware/cartAuthMiddleware.js";

const router = express.Router();

/*
|----------------------------------------------------------------------
| GET PRODUCT RATING
|----------------------------------------------------------------------
|
| Public route.
|
| Anyone can see:
| - Average rating
| - Total ratings
|
*/

router.get("/:productId", getProductRatingController);

/*
|----------------------------------------------------------------------
| SAVE PRODUCT RATING
|----------------------------------------------------------------------
|
| User must be authenticated.
|
*/

router.post("/:productId", protectCart, saveProductRatingController);

export default router;
