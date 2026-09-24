import {
  findApplicableCoupon,
  getApplicableCoupons,
} from "./couponRulesService.js";

/*
|----------------------------------------------------------------------
| CUSTOMER AVAILABLE COUPONS
|----------------------------------------------------------------------
*/

const getAvailableCoupons = async (subtotal) => {
  return getApplicableCoupons(subtotal);
};

/*
|----------------------------------------------------------------------
| APPLY / VALIDATE COUPON FOR CHECKOUT
|----------------------------------------------------------------------
*/

const applyCoupon = async (code, subtotal) => {
  const result = await findApplicableCoupon(code, subtotal);

  return {
    coupon: {
      _id: result.coupon._id,

      code: result.coupon.code,

      discountType: result.coupon.discountType,

      discountValue: result.coupon.discountValue,

      minOrderAmount: result.coupon.minOrderAmount,

      maxDiscountAmount: result.coupon.maxDiscountAmount,

      expiryDate: result.coupon.expiryDate,
    },

    subtotal: result.subtotal,

    discountAmount: result.discountAmount,

    finalAmount: Number((result.subtotal - result.discountAmount).toFixed(2)),
  };
};

export { getAvailableCoupons, applyCoupon };

export default getAvailableCoupons;
