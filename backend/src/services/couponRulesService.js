import Coupon from "../models/Coupon.js";

/*
|----------------------------------------------------------------------
| COUPON RULES
|----------------------------------------------------------------------
|
| These rules are shared by:
| - customer coupon listing
| - coupon apply/validation
| - order creation
|
| A coupon is applicable only when:
| - it exists
| - it is active
| - it has not expired
| - its usage limit has not been exhausted
| - the order subtotal satisfies the minimum order amount
|
| Only one coupon code is accepted by an order. The order model stores
| one couponCode/couponDiscount pair, so multiple coupons cannot be
| combined.
|
|----------------------------------------------------------------------
*/

const normalizeCouponCode = (code) =>
  String(code || "")
    .trim()
    .toUpperCase();

const validateSubtotal = (subtotal) => {
  const numericSubtotal = Number(subtotal);

  if (!Number.isFinite(numericSubtotal) || numericSubtotal < 0) {
    throw new Error("Order subtotal must be a valid non-negative number");
  }

  return Number(numericSubtotal.toFixed(2));
};

const hasUsageAvailable = (coupon) => {
  if (coupon.usageLimit === null || coupon.usageLimit === undefined) {
    return true;
  }

  return coupon.usedCount < coupon.usageLimit;
};

const calculateCouponDiscount = (coupon, subtotal) => {
  let discountAmount = 0;

  if (coupon.discountType === "percentage") {
    discountAmount = (subtotal * coupon.discountValue) / 100;

    if (
      coupon.maxDiscountAmount !== null &&
      coupon.maxDiscountAmount !== undefined
    ) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  /*
   * A coupon must never reduce the order below zero.
   */
  discountAmount = Math.min(discountAmount, subtotal);

  return Number(Math.max(discountAmount, 0).toFixed(2));
};

const findApplicableCoupon = async (code, subtotal) => {
  const normalizedCode = normalizeCouponCode(code);

  const numericSubtotal = validateSubtotal(subtotal);

  if (!normalizedCode) {
    throw new Error("Coupon code is required");
  }

  const coupon = await Coupon.findOne({
    code: normalizedCode,

    isActive: true,

    expiryDate: {
      $gt: new Date(),
    },

    minOrderAmount: {
      $lte: numericSubtotal,
    },

    $or: [
      {
        usageLimit: null,
      },

      {
        $expr: {
          $lt: ["$usedCount", "$usageLimit"],
        },
      },
    ],
  });

  if (!coupon) {
    const existingCoupon = await Coupon.findOne({
      code: normalizedCode,
    }).lean();

    if (!existingCoupon) {
      throw new Error("Invalid coupon code");
    }

    if (!existingCoupon.isActive) {
      throw new Error("This coupon is currently inactive");
    }

    if (new Date(existingCoupon.expiryDate) <= new Date()) {
      throw new Error("This coupon has expired");
    }

    if (
      existingCoupon.usageLimit !== null &&
      existingCoupon.usageLimit !== undefined &&
      existingCoupon.usedCount >= existingCoupon.usageLimit
    ) {
      throw new Error("This coupon has reached its usage limit");
    }

    if (numericSubtotal < Number(existingCoupon.minOrderAmount || 0)) {
      throw new Error(
        `Minimum order amount for this coupon is ₹${Number(
          existingCoupon.minOrderAmount || 0,
        ).toLocaleString("en-IN", {
          maximumFractionDigits: 2,
        })}`,
      );
    }

    throw new Error("This coupon cannot be applied to this order");
  }

  const discountAmount = calculateCouponDiscount(coupon, numericSubtotal);

  return {
    coupon,
    subtotal: numericSubtotal,
    discountAmount,
  };
};

/*
|----------------------------------------------------------------------
| GET ONLY APPLICABLE COUPONS
|----------------------------------------------------------------------
*/

const getApplicableCoupons = async (subtotal) => {
  const numericSubtotal = validateSubtotal(subtotal);

  const now = new Date();

  const coupons = await Coupon.find({
    isActive: true,

    expiryDate: {
      $gt: now,
    },

    minOrderAmount: {
      $lte: numericSubtotal,
    },

    $or: [
      {
        usageLimit: null,
      },

      {
        $expr: {
          $lt: ["$usedCount", "$usageLimit"],
        },
      },
    ],
  })
    .select(
      "code discountType discountValue minOrderAmount maxDiscountAmount expiryDate usageLimit usedCount",
    )
    .sort({
      createdAt: -1,
    })
    .lean();

  return coupons.map((coupon) => ({
    _id: coupon._id,

    code: coupon.code,

    discountType: coupon.discountType,

    discountValue: coupon.discountValue,

    minOrderAmount: coupon.minOrderAmount,

    maxDiscountAmount: coupon.maxDiscountAmount,

    expiryDate: coupon.expiryDate,

    usageLimit: coupon.usageLimit,

    usedCount: coupon.usedCount,

    remainingUses:
      coupon.usageLimit === null || coupon.usageLimit === undefined
        ? null
        : Math.max(coupon.usageLimit - coupon.usedCount, 0),

    applicableSubtotal: numericSubtotal,
  }));
};

/*
|----------------------------------------------------------------------
| RESERVE COUPON USAGE DURING ORDER CREATION
|----------------------------------------------------------------------
|
| This update is atomic. It prevents two customers from consuming the
| final available usage at the same time.
|
|----------------------------------------------------------------------
*/

const reserveCouponUsage = async (code, subtotal) => {
  const normalizedCode = normalizeCouponCode(code);

  const numericSubtotal = validateSubtotal(subtotal);

  if (!normalizedCode) {
    return null;
  }

  const coupon = await Coupon.findOneAndUpdate(
    {
      code: normalizedCode,

      isActive: true,

      expiryDate: {
        $gt: new Date(),
      },

      minOrderAmount: {
        $lte: numericSubtotal,
      },

      $or: [
        {
          usageLimit: null,
        },

        {
          $expr: {
            $lt: ["$usedCount", "$usageLimit"],
          },
        },
      ],
    },

    {
      $inc: {
        usedCount: 1,
      },
    },

    {
      new: true,
    },
  );

  if (!coupon) {
    throw new Error("This coupon is no longer available for this order");
  }

  const discountAmount = calculateCouponDiscount(coupon, numericSubtotal);

  return {
    coupon,

    subtotal: numericSubtotal,

    discountAmount,
  };
};

/*
|----------------------------------------------------------------------
| ROLLBACK COUPON USAGE
|----------------------------------------------------------------------
*/

const rollbackCouponUsage = async (code) => {
  const normalizedCode = normalizeCouponCode(code);

  if (!normalizedCode) {
    return;
  }

  await Coupon.updateOne(
    {
      code: normalizedCode,

      usedCount: {
        $gt: 0,
      },
    },

    {
      $inc: {
        usedCount: -1,
      },
    },
  );
};

export {
  normalizeCouponCode,
  validateSubtotal,
  calculateCouponDiscount,
  findApplicableCoupon,
  getApplicableCoupons,
  reserveCouponUsage,
  rollbackCouponUsage,
};
