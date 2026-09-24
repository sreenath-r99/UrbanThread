import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must contain at least 2 characters"],
      maxlength: [150, "Product name cannot exceed 150 characters"],
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [3000, "Product description cannot exceed 3000 characters"],
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },

    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
      required: [true, "Subcategory is required"],
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },

        publicId: {
          type: String,
          default: "",
        },
      },
    ],

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },

    discountPrice: {
      type: Number,
      default: null,
      min: [0, "Discount price cannot be negative"],
    },

    // Size-wise stock
    sizes: [
      {
        size: {
          type: String,
          enum: {
            values: ["S", "M", "L", "XL", "XXL"],
            message: "Size must be S, M, L, XL, or XXL",
          },
          required: true,
        },

        stock: {
          type: Number,
          required: true,
          min: [0, "Size stock cannot be negative"],
          default: 0,
        },
      },
    ],

    // Total stock = sum of all size stocks
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
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

productSchema.index({
  name: 1,
  isDeleted: 1,
});

productSchema.index({
  category: 1,
  subcategory: 1,
  isDeleted: 1,
});

const Product = mongoose.model("Product", productSchema);

export default Product;
