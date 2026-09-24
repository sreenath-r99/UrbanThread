import {
  getAvailableCoupons,
  applyCoupon,
} from "../services/availableCouponService.js";

/*
|----------------------------------------------------------------------
| GET APPLICABLE COUPONS
|----------------------------------------------------------------------
|
| GET /api/coupons/available?subtotal=1500
|
| Only coupons applicable to the current cart subtotal are returned.
|
|----------------------------------------------------------------------
*/

export const getAvailableCouponsController = async (req, res) => {
  try {
    const subtotal = Number(req.query.subtotal);

    if (!Number.isFinite(subtotal) || subtotal < 0) {
      return res.status(400).json({
        success: false,

        message: "A valid order subtotal is required",
      });
    }

    const coupons = await getAvailableCoupons(subtotal);

    return res.status(200).json({
      success: true,

      coupons,
    });
  } catch (error) {
    console.error("GET AVAILABLE COUPONS ERROR:", error);

    return res.status(500).json({
      success: false,

      message: error.message || "Unable to load applicable coupons",
    });
  }
};

/*
|----------------------------------------------------------------------
| APPLY COUPON
|----------------------------------------------------------------------
|
| POST /api/coupons/available/apply
|
| Body:
| {
|   code: "WELCOME10",
|   subtotal: 1500
| }
|
| This only validates/calculates the coupon. Usage is incremented when
| the order is actually created.
|
|----------------------------------------------------------------------
*/

export const applyCouponController = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,

        message: "Coupon code is required",
      });
    }

    const numericSubtotal = Number(subtotal);

    if (!Number.isFinite(numericSubtotal) || numericSubtotal < 0) {
      return res.status(400).json({
        success: false,

        message: "A valid order subtotal is required",
      });
    }

    const result = await applyCoupon(code, numericSubtotal);

    return res.status(200).json({
      success: true,

      message: "Coupon applied successfully",

      ...result,
    });
  } catch (error) {
    console.error("APPLY COUPON ERROR:", error);

    return res.status(400).json({
      success: false,

      message: error.message || "Unable to apply coupon",
    });
  }
};
