import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, "Coupon code must contain at least 3 characters"],
      maxlength: [30, "Coupon code cannot exceed 30 characters"],
    },

    discountType: {
      type: String,
      required: [true, "Discount type is required"],
      enum: {
        values: ["percentage", "fixed"],
        message: "Discount type must be percentage or fixed",
      },
    },

    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount value cannot be negative"],
    },

    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, "Minimum order amount cannot be negative"],
    },

    maxDiscountAmount: {
      type: Number,
      default: null,
      min: [0, "Maximum discount amount cannot be negative"],
    },

    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },

    usageLimit: {
      type: Number,
      default: null,
      min: [1, "Usage limit must be at least 1"],
    },

    usedCount: {
      type: Number,
      default: 0,
      min: [0, "Used count cannot be negative"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

/*
|--------------------------------------------------------------------------
| COUPON VALIDATION
|--------------------------------------------------------------------------
|
| Important:
|
| This hook intentionally does NOT use:
|
|   function (next) {}
|
| because the current Mongoose setup is producing:
|
|   "next is not a function"
|
| Instead, validation is performed synchronously inside
| the pre-validation hook.
|
|--------------------------------------------------------------------------
*/

couponSchema.pre("validate", function () {
  /*
    |--------------------------------------------------------------------------
    | PERCENTAGE VALIDATION
    |--------------------------------------------------------------------------
    */

  if (this.discountType === "percentage" && this.discountValue <= 0) {
    this.invalidate(
      "discountValue",
      "Percentage discount must be greater than 0",
    );
  }

  if (this.discountType === "percentage" && this.discountValue > 100) {
    this.invalidate("discountValue", "Percentage discount cannot exceed 100");
  }

  /*
    |--------------------------------------------------------------------------
    | FIXED DISCOUNT VALIDATION
    |--------------------------------------------------------------------------
    */

  if (this.discountType === "fixed" && this.discountValue <= 0) {
    this.invalidate("discountValue", "Fixed discount must be greater than 0");
  }

  /*
    |--------------------------------------------------------------------------
    | MAX DISCOUNT
    |--------------------------------------------------------------------------
    |
    | Maximum discount is meaningful only for percentage
    | coupons.
    |
    */

  if (this.discountType === "fixed") {
    this.maxDiscountAmount = null;
  }

  /*
    |--------------------------------------------------------------------------
    | EXPIRY DATE
    |--------------------------------------------------------------------------
    */

  if (this.expiryDate && Number.isNaN(new Date(this.expiryDate).getTime())) {
    this.invalidate("expiryDate", "Expiry date must be valid");
  }
});

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);

export default Coupon;
