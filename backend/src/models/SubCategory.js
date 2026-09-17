import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subcategory name is required"],
      trim: true,
      minlength: [2, "Subcategory name must contain at least 2 characters"],
      maxlength: [100, "Subcategory name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Parent category is required"],
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
  }
);

// Prevent duplicate subcategory names inside the same parent category
subcategorySchema.index(
  {
    name: 1,
    category: 1,
  },
  {
    unique: true,
  }
);

const Subcategory = mongoose.model(
  "Subcategory",
  subcategorySchema
);

export default Subcategory;