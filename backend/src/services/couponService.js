import mongoose from "mongoose";

import Coupon from "../models/Coupon.js";

const normalizeCode = (code) => {
  if (typeof code !== "string") {
    throw new Error("Coupon code is required");
  }

  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) {
    throw new Error("Coupon code is required");
  }

  return normalizedCode;
};

const validateDiscountFields = (discountType, discountValue) => {
  if (!["percentage", "fixed"].includes(discountType)) {
    throw new Error("Discount type must be percentage or fixed");
  }

  const numericValue = Number(discountValue);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    throw new Error("Discount value must be greater than 0");
  }

  if (discountType === "percentage" && numericValue > 100) {
    throw new Error("Percentage discount cannot exceed 100");
  }

  return numericValue;
};

const validateCouponAvailability = (coupon) => {
  if (!coupon) {
    throw new Error("Invalid coupon code");
  }

  if (!coupon.isActive) {
    throw new Error("This coupon is inactive");
  }

  const now = new Date();

  if (coupon.expiryDate <= now) {
    throw new Error("This coupon has expired");
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("This coupon has reached its usage limit");
  }
};

const calculateCouponDiscount = (coupon, subtotal) => {
  const numericSubtotal = Number(subtotal);

  if (!Number.isFinite(numericSubtotal) || numericSubtotal < 0) {
    throw new Error("Invalid order amount");
  }

  if (numericSubtotal < Number(coupon.minOrderAmount || 0)) {
    throw new Error(
      `Minimum order amount for this coupon is ₹${Number(
        coupon.minOrderAmount,
      ).toLocaleString("en-IN")}`,
    );
  }

  let discount = 0;

  if (coupon.discountType === "percentage") {
    discount = (numericSubtotal * coupon.discountValue) / 100;

    if (
      coupon.maxDiscountAmount !== null &&
      coupon.maxDiscountAmount !== undefined
    ) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  } else {
    discount = coupon.discountValue;
  }

  discount = Math.min(discount, numericSubtotal);

  return Number(discount.toFixed(2));
};

export const getCoupons = async ({
  search = "",
  includeInactive = true,
} = {}) => {
  const query = {};

  if (!includeInactive) {
    query.isActive = true;
  }

  const trimmedSearch = search.trim();

  if (trimmedSearch) {
    query.code = {
      $regex: trimmedSearch,
      $options: "i",
    };
  }

  return Coupon.find(query)
    .sort({
      createdAt: -1,
    })
    .lean();
};

export const getCouponById = async (couponId) => {
  if (!mongoose.Types.ObjectId.isValid(couponId)) {
    throw new Error("Invalid coupon ID");
  }

  const coupon = await Coupon.findById(couponId).lean();

  if (!coupon) {
    throw new Error("Coupon not found");
  }

  return coupon;
};

export const createCoupon = async (data) => {
  const {
    code,
    discountType,
    discountValue,
    minOrderAmount = 0,
    maxDiscountAmount = null,
    expiryDate,
    usageLimit = null,
    isActive = true,
  } = data;

  const normalizedCode = normalizeCode(code);

  const numericDiscount = validateDiscountFields(discountType, discountValue);

  const numericMinimum = Number(minOrderAmount);

  if (!Number.isFinite(numericMinimum) || numericMinimum < 0) {
    throw new Error("Minimum order amount is invalid");
  }

  const expiry = new Date(expiryDate);

  if (Number.isNaN(expiry.getTime())) {
    throw new Error("Invalid expiry date");
  }

  if (expiry <= new Date()) {
    throw new Error("Expiry date must be in the future");
  }

  let numericMaxDiscount = null;

  if (
    discountType === "percentage" &&
    maxDiscountAmount !== null &&
    maxDiscountAmount !== ""
  ) {
    numericMaxDiscount = Number(maxDiscountAmount);

    if (!Number.isFinite(numericMaxDiscount) || numericMaxDiscount <= 0) {
      throw new Error("Maximum discount amount is invalid");
    }
  }

  let numericUsageLimit = null;

  if (usageLimit !== null && usageLimit !== "") {
    numericUsageLimit = Number(usageLimit);

    if (!Number.isInteger(numericUsageLimit) || numericUsageLimit < 1) {
      throw new Error("Usage limit must be a positive whole number");
    }
  }

  const existingCoupon = await Coupon.findOne({
    code: normalizedCode,
  });

  if (existingCoupon) {
    throw new Error("A coupon with this code already exists");
  }

  const coupon = await Coupon.create({
    code: normalizedCode,
    discountType,
    discountValue: numericDiscount,
    minOrderAmount: numericMinimum,
    maxDiscountAmount: numericMaxDiscount,
    expiryDate: expiry,
    usageLimit: numericUsageLimit,
    isActive: Boolean(isActive),
  });

  return coupon;
};

export const updateCoupon = async (couponId, data) => {
  if (!mongoose.Types.ObjectId.isValid(couponId)) {
    throw new Error("Invalid coupon ID");
  }

  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    throw new Error("Coupon not found");
  }

  const {
    code,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscountAmount,
    expiryDate,
    usageLimit,
    isActive,
  } = data;

  if (code !== undefined) {
    const normalizedCode = normalizeCode(code);

    const duplicate = await Coupon.findOne({
      code: normalizedCode,
      _id: {
        $ne: couponId,
      },
    });

    if (duplicate) {
      throw new Error("A coupon with this code already exists");
    }

    coupon.code = normalizedCode;
  }

  const nextType =
    discountType !== undefined ? discountType : coupon.discountType;

  if (discountType !== undefined || discountValue !== undefined) {
    const nextValue =
      discountValue !== undefined ? discountValue : coupon.discountValue;

    coupon.discountType = nextType;

    coupon.discountValue = validateDiscountFields(nextType, nextValue);
  }

  if (minOrderAmount !== undefined) {
    const minimum = Number(minOrderAmount);

    if (!Number.isFinite(minimum) || minimum < 0) {
      throw new Error("Minimum order amount is invalid");
    }

    coupon.minOrderAmount = minimum;
  }

  if (maxDiscountAmount !== undefined) {
    if (coupon.discountType === "percentage") {
      if (maxDiscountAmount === null || maxDiscountAmount === "") {
        coupon.maxDiscountAmount = null;
      } else {
        const maximum = Number(maxDiscountAmount);

        if (!Number.isFinite(maximum) || maximum <= 0) {
          throw new Error("Maximum discount amount is invalid");
        }

        coupon.maxDiscountAmount = maximum;
      }
    } else {
      coupon.maxDiscountAmount = null;
    }
  }

  if (expiryDate !== undefined) {
    const expiry = new Date(expiryDate);

    if (Number.isNaN(expiry.getTime())) {
      throw new Error("Invalid expiry date");
    }

    if (expiry <= new Date()) {
      throw new Error("Expiry date must be in the future");
    }

    coupon.expiryDate = expiry;
  }

  if (usageLimit !== undefined) {
    if (usageLimit === null || usageLimit === "") {
      coupon.usageLimit = null;
    } else {
      const numericUsageLimit = Number(usageLimit);

      if (!Number.isInteger(numericUsageLimit) || numericUsageLimit < 1) {
        throw new Error("Usage limit must be a positive whole number");
      }

      if (numericUsageLimit < coupon.usedCount) {
        throw new Error(
          "Usage limit cannot be lower than the current used count",
        );
      }

      coupon.usageLimit = numericUsageLimit;
    }
  }

  if (isActive !== undefined) {
    coupon.isActive = Boolean(isActive);
  }

  await coupon.save();

  return coupon;
};

export const toggleCouponStatus = async (couponId) => {
  if (!mongoose.Types.ObjectId.isValid(couponId)) {
    throw new Error("Invalid coupon ID");
  }

  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    throw new Error("Coupon not found");
  }

  coupon.isActive = !coupon.isActive;

  await coupon.save();

  return coupon;
};

export const deleteCoupon = async (couponId) => {
  if (!mongoose.Types.ObjectId.isValid(couponId)) {
    throw new Error("Invalid coupon ID");
  }

  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    throw new Error("Coupon not found");
  }

  await Coupon.findByIdAndDelete(couponId);

  return {
    couponId,
  };
};

export const validateCoupon = async (code, subtotal) => {
  const normalizedCode = normalizeCode(code);

  const coupon = await Coupon.findOne({
    code: normalizedCode,
  });

  validateCouponAvailability(coupon);

  const couponDiscount = calculateCouponDiscount(coupon, subtotal);

  return {
    couponId: coupon._id,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    couponDiscount,
    minOrderAmount: coupon.minOrderAmount,
  };
};

export const incrementCouponUsage = async (couponCode) => {
  const normalizedCode = normalizeCode(couponCode);

  const query = {
    code: normalizedCode,
    isActive: true,
    expiryDate: {
      $gt: new Date(),
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
  };

  const coupon = await Coupon.findOneAndUpdate(
    query,
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
    throw new Error("Coupon is no longer available");
  }

  return coupon;
};

export { normalizeCode, calculateCouponDiscount };
