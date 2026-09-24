import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    comment: {
      type: String,
      required: [true, "Review is required"],
      trim: true,
      minlength: [3, "Review must contain at least 3 characters"],
      maxlength: [1000, "Review cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  },
);

/*
|--------------------------------------------------------------------------
| ONE REVIEW PER USER PER PRODUCT
|--------------------------------------------------------------------------
*/

reviewSchema.index(
  {
    user: 1,
    product: 1,
  },
  {
    unique: true,
  },
);

/*
|--------------------------------------------------------------------------
| PRODUCT REVIEW LOOKUP
|--------------------------------------------------------------------------
*/

reviewSchema.index({
  product: 1,
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
