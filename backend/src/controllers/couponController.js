import * as couponService from "../services/couponService.js";

/*
|--------------------------------------------------------------------------
| ADMIN — GET COUPONS
|--------------------------------------------------------------------------
*/

export const getCouponsController = async (req, res) => {
  try {
    const { search = "", includeInactive = "true" } = req.query;

    const coupons = await couponService.getCoupons({
      search,
      includeInactive: includeInactive !== "false",
    });

    return res.status(200).json({
      success: true,
      message: "Coupons fetched successfully",
      coupons,
    });
  } catch (error) {
    console.error("GET COUPONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to fetch coupons",
    });
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN — GET SINGLE COUPON
|--------------------------------------------------------------------------
*/

export const getCouponController = async (req, res) => {
  try {
    const coupon = await couponService.getCouponById(req.params.couponId);

    return res.status(200).json({
      success: true,
      message: "Coupon fetched successfully",
      coupon,
    });
  } catch (error) {
    console.error("GET COUPON ERROR:", error);

    return res.status(404).json({
      success: false,
      message: error.message || "Coupon not found",
    });
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN — CREATE
|--------------------------------------------------------------------------
*/

export const createCouponController = async (req, res) => {
  try {
    const coupon = await couponService.createCoupon(req.body);

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error("CREATE COUPON ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to create coupon",
    });
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN — UPDATE
|--------------------------------------------------------------------------
*/

export const updateCouponController = async (req, res) => {
  try {
    const coupon = await couponService.updateCoupon(
      req.params.couponId,
      req.body,
    );

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    console.error("UPDATE COUPON ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to update coupon",
    });
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN — TOGGLE
|--------------------------------------------------------------------------
*/

export const toggleCouponStatusController = async (req, res) => {
  try {
    const coupon = await couponService.toggleCouponStatus(req.params.couponId);

    return res.status(200).json({
      success: true,
      message: "Coupon status updated successfully",
      coupon,
    });
  } catch (error) {
    console.error("TOGGLE COUPON ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to update coupon status",
    });
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN — DELETE
|--------------------------------------------------------------------------
*/

export const deleteCouponController = async (req, res) => {
  try {
    const result = await couponService.deleteCoupon(req.params.couponId);

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
      ...result,
    });
  } catch (error) {
    console.error("DELETE COUPON ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to delete coupon",
    });
  }
};

/*
|--------------------------------------------------------------------------
| USER — VALIDATE COUPON
|--------------------------------------------------------------------------
*/

export const validateCouponController = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    const result = await couponService.validateCoupon(code, subtotal);

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      ...result,
    });
  } catch (error) {
    console.error("VALIDATE COUPON ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to apply coupon",
    });
  }
};
