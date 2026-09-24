// backend/src/routes/wishlistRoutes.js

import express from "express";

import {
  getWishlistController,
  addToWishlistController,
  removeFromWishlistController,
  checkWishlistController,
  clearWishlistController,
} from "../controllers/wishlistController.js";

import protectCart from "../middleware/cartAuthMiddleware.js";

const router = express.Router();

router.use(protectCart);

router.get("/", getWishlistController);

router.get("/check/:productId", checkWishlistController);

router.post("/:productId", addToWishlistController);

router.delete("/:productId", removeFromWishlistController);

router.delete("/", clearWishlistController);

export default router;
