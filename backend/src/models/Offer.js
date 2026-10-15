
import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Offer name is required"],
      trim: true,
      maxlength: [100, "Offer name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    offerType: {
      type: String,
      required: [true, "Offer type is required"],
      enum: {
        values: ["Product", "Category"],
        message: "Offer type must be Product or Category",
      },
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    discountType: {
      type: String,
      required: [true, "Discount type is required"],
      enum: {
        values: ["Percentage", "Fixed"],
        message: "Discount type must be Percentage or Fixed",
      },
    },

    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0.01, "Discount value must be greater than zero"],
    },

    startDate: {
      type: Date,
      required: [true, "Offer start date is required"],
    },

    endDate: {
      type: Date,
      required: [true, "Offer end date is required"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Validate that the offer targets the correct entity.
offerSchema.pre("validate", function () {
  if (this.offerType === "Product") {
    if (!this.product) {
      this.invalidate(
        "product",
        "A product must be selected for a product offer",
      );
    }

    if (this.category) {
      this.invalidate(
        "category",
        "A product offer cannot target a category",
      );
    }
  }

  if (this.offerType === "Category") {
    if (!this.category) {
      this.invalidate(
        "category",
        "A category must be selected for a category offer",
      );
    }

    if (this.product) {
      this.invalidate(
        "product",
        "A category offer cannot target a product",
      );
    }
  }

  if (
    this.discountType === "Percentage" &&
    this.discountValue > 100
  ) {
    this.invalidate(
      "discountValue",
      "Percentage discount cannot exceed 100%",
    );
  }

  if (
    this.startDate &&
    this.endDate &&
    this.endDate <= this.startDate
  ) {
    this.invalidate(
      "endDate",
      "Offer end date must be after the start date",
    );
  }
});

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;
