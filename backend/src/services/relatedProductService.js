import mongoose from "mongoose";

import Product from "../models/Product.js";

const getRelatedProducts = async (productId, limit = 4) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID");
  }

  const currentProduct = await Product.findOne({
    _id: productId,
    isDeleted: false,
    isActive: true,
  })
    .select("category subcategory")
    .lean();

  if (!currentProduct) {
    throw new Error("Product is unavailable or no longer exists");
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 4, 1), 8);

  /*
  |--------------------------------------------------------------------------
  | FIRST: PRODUCTS FROM SAME SUBCATEGORY
  |--------------------------------------------------------------------------
  */

  const relatedProducts = await Product.find({
    _id: {
      $ne: productId,
    },
    category: currentProduct.category,
    subcategory: currentProduct.subcategory,
    isDeleted: false,
    isActive: true,
  })
    .populate("category", "name")
    .populate("subcategory", "name")
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();

  /*
  |--------------------------------------------------------------------------
  | IF NOT ENOUGH PRODUCTS, FILL FROM SAME CATEGORY
  |--------------------------------------------------------------------------
  */

  if (relatedProducts.length < safeLimit) {
    const existingIds = [
      productId,
      ...relatedProducts.map((product) => product._id.toString()),
    ];

    const remainingProducts = await Product.find({
      _id: {
        $nin: existingIds,
      },
      category: currentProduct.category,
      isDeleted: false,
      isActive: true,
    })
      .populate("category", "name")
      .populate("subcategory", "name")
      .sort({ createdAt: -1 })
      .limit(safeLimit - relatedProducts.length)
      .lean();

    relatedProducts.push(...remainingProducts);
  }

  return relatedProducts;
};

export { getRelatedProducts };
