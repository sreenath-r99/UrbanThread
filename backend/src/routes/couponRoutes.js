import express from "express";

import {
  getCouponsController,
  getCouponController,
  createCouponController,
  updateCouponController,
  toggleCouponStatusController,
  deleteCouponController,
  validateCouponController,
} from "../controllers/couponController.js";

import protectCart from "../middleware/cartAuthMiddleware.js";
import { protectAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| USER - VALIDATE COUPON
|--------------------------------------------------------------------------
*/

router.post("/validate", protectCart, validateCouponController);

/*
|--------------------------------------------------------------------------
| ADMIN - COUPON MANAGEMENT
|--------------------------------------------------------------------------
*/

router.get("/", protectAdmin, getCouponsController);

router.get("/:couponId", protectAdmin, getCouponController);

router.post("/", protectAdmin, createCouponController);

router.patch("/:couponId", protectAdmin, updateCouponController);

router.patch("/:couponId/toggle", protectAdmin, toggleCouponStatusController);

router.delete("/:couponId", protectAdmin, deleteCouponController);

export default router;
