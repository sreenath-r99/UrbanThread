import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
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

    rating: {
      type: Number,
      required: [true, "Rating is required"],

      min: [1, "Rating must be at least 1"],

      max: [5, "Rating cannot exceed 5"],

      validate: {
        validator: Number.isInteger,

        message: "Rating must be a whole number from 1 to 5",
      },
    },
  },

  {
    timestamps: true,
  },
);

/*
|----------------------------------------------------------------------
| ONE RATING PER USER PER PRODUCT
|----------------------------------------------------------------------
*/

ratingSchema.index(
  {
    user: 1,
    product: 1,
  },
  {
    unique: true,
  },
);

/*
|----------------------------------------------------------------------
| PRODUCT RATING LOOKUP
|----------------------------------------------------------------------
*/

ratingSchema.index({
  product: 1,
});

const Rating = mongoose.model("Rating", ratingSchema);

export default Rating;
