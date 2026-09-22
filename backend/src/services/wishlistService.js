// backend/src/services/wishlistService.js

import mongoose from "mongoose";

import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({
    user: userId,
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      items: [],
    });
  }

  return wishlist;
};

const validateProduct = async (productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID");
  }

  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
    isActive: true,
  })
    .populate("category", "name")
    .populate("subcategory", "name")
    .lean();

  if (!product) {
    throw new Error(
      "Product is unavailable or no longer exists"
    );
  }

  return product;
};

const cleanInvalidWishlistItems = async (
  wishlist
) => {
  const productIds = wishlist.items.map(
    (item) => item.product
  );

  if (productIds.length === 0) {
    return;
  }

  const validProducts = await Product.find({
    _id: {
      $in: productIds,
    },
    isDeleted: false,
    isActive: true,
  })
    .select("_id")
    .lean();

  const validProductIds = new Set(
    validProducts.map((product) =>
      product._id.toString()
    )
  );

  const cleanedItems = wishlist.items.filter(
    (item) =>
      validProductIds.has(
        item.product.toString()
      )
  );

  if (
    cleanedItems.length !==
    wishlist.items.length
  ) {
    wishlist.items = cleanedItems;

    await wishlist.save();
  }
};

const getWishlist = async (userId) => {
  const wishlist = await Wishlist.findOne({
    user: userId,
  })
    .populate({
      path: "items.product",
      select:
        "name description images price discountPrice sizes stock category subcategory isActive isDeleted createdAt",
      populate: [
        {
          path: "category",
          select: "name",
        },
        {
          path: "subcategory",
          select: "name",
        },
      ],
    })
    .lean();

  if (!wishlist) {
    return {
      _id: null,
      user: userId,
      items: [],
      itemCount: 0,
    };
  }

  const validItems = wishlist.items.filter(
    (item) =>
      item.product &&
      !item.product.isDeleted &&
      item.product.isActive
  );

  return {
    _id: wishlist._id,
    user: wishlist.user,
    items: validItems,
    itemCount: validItems.length,
  };
};

const addToWishlist = async (
  userId,
  productId
) => {
  const product = await validateProduct(
    productId
  );

  const wishlist =
    await getOrCreateWishlist(userId);

  const alreadyExists =
    wishlist.items.some(
      (item) =>
        item.product.toString() ===
        product._id.toString()
    );

  if (alreadyExists) {
    return getWishlist(userId);
  }

  wishlist.items.push({
    product: product._id,
    addedAt: new Date(),
  });

  await wishlist.save();

  return getWishlist(userId);
};

const removeFromWishlist = async (
  userId,
  productId
) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID");
  }

  const wishlist = await Wishlist.findOne({
    user: userId,
  });

  if (!wishlist) {
    return {
      _id: null,
      user: userId,
      items: [],
      itemCount: 0,
    };
  }

  const itemExists = wishlist.items.some(
    (item) =>
      item.product.toString() ===
      productId.toString()
  );

  if (!itemExists) {
    throw new Error(
      "Product is not in your wishlist"
    );
  }

  wishlist.items = wishlist.items.filter(
    (item) =>
      item.product.toString() !==
      productId.toString()
  );

  await wishlist.save();

  return getWishlist(userId);
};

const removeProductFromWishlist = async (
  userId,
  productId
) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return;
  }

  const wishlist = await Wishlist.findOne({
    user: userId,
  });

  if (!wishlist) {
    return;
  }

  const originalLength =
    wishlist.items.length;

  wishlist.items = wishlist.items.filter(
    (item) =>
      item.product.toString() !==
      productId.toString()
  );

  if (
    wishlist.items.length !== originalLength
  ) {
    await wishlist.save();
  }
};

const isProductInWishlist = async (
  userId,
  productId
) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID");
  }

  const wishlist = await Wishlist.findOne({
    user: userId,
    "items.product": productId,
  })
    .select("_id")
    .lean();

  return Boolean(wishlist);
};

const clearWishlist = async (userId) => {
  const wishlist = await Wishlist.findOne({
    user: userId,
  });

  if (!wishlist) {
    return {
      _id: null,
      user: userId,
      items: [],
      itemCount: 0,
    };
  }

  wishlist.items = [];

  await wishlist.save();

  return {
    _id: wishlist._id,
    user: wishlist.user,
    items: [],
    itemCount: 0,
  };
};

export {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  removeProductFromWishlist,
  isProductInWishlist,
  clearWishlist,
  cleanInvalidWishlistItems,
};