import express from "express";

import {
  getCartController,
  addToCartController,
  updateCartItemController,
  removeFromCartController,
  clearCartController,
} from "../controllers/cartController.js";

import protectCart from "../middleware/cartAuthMiddleware.js";

const router = express.Router();

router.use(protectCart);

router.get(
  "/",
  getCartController
);

router.post(
  "/items",
  addToCartController
);

router.patch(
  "/items/:itemId",
  updateCartItemController
);

router.delete(
  "/items/:itemId",
  removeFromCartController
);

router.delete(
  "/",
  clearCartController
);

export default router;