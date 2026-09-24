import express from "express";

import {
  getAvailableCouponsController,
  applyCouponController,
} from "../controllers/availableCouponController.js";

import protectCart from "../middleware/cartAuthMiddleware.js";

const router = express.Router();

/*
|----------------------------------------------------------------------
| GET APPLICABLE COUPONS
|----------------------------------------------------------------------
*/

router.get("/", protectCart, getAvailableCouponsController);

/*
|----------------------------------------------------------------------
| APPLY / VALIDATE COUPON
|----------------------------------------------------------------------
*/

router.post("/apply", protectCart, applyCouponController);

export default router;
