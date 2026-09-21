import mongoose from "mongoose";

import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const getProductPrice = (product) => {
  if (
    product.discountPrice !== null &&
    product.discountPrice !== undefined &&
    product.discountPrice < product.price
  ) {
    return product.discountPrice;
  }

  return product.price;
};

const getSizeStock = (product, size) => {
  if (
    Array.isArray(product.sizes) &&
    product.sizes.length > 0
  ) {
    const sizeEntry = product.sizes.find(
      (item) => item.size === size
    );

    if (!sizeEntry) {
      throw new Error(
        `Size ${size} is not available for this product`
      );
    }

    return sizeEntry.stock;
  }

  return product.stock;
};

const validateProduct = async (productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID");
  }

  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
    isActive: true,
  });

  if (!product) {
    throw new Error(
      "Product is unavailable or no longer exists"
    );
  }

  return product;
};

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  return cart;
};

const addToCart = async (
  userId,
  productId,
  size,
  quantity
) => {
  const product = await validateProduct(
    productId
  );

  const normalizedSize = size?.trim();

  if (!normalizedSize) {
    throw new Error(
      "Please select a size"
    );
  }

  const requestedQuantity = Number(quantity);

  if (
    !Number.isInteger(requestedQuantity) ||
    requestedQuantity < 1
  ) {
    throw new Error(
      "Quantity must be a positive integer"
    );
  }

  const availableStock = getSizeStock(
    product,
    normalizedSize
  );

  if (availableStock <= 0) {
    throw new Error(
      `Size ${normalizedSize} is out of stock`
    );
  }

  const cart = await getOrCreateCart(userId);

  const existingItem = cart.items.find(
    (item) =>
      item.product.toString() ===
        productId.toString() &&
      item.size === normalizedSize
  );

  if (existingItem) {
    const newQuantity =
      existingItem.quantity +
      requestedQuantity;

    if (newQuantity > availableStock) {
      throw new Error(
        `Only ${availableStock} item${
          availableStock === 1 ? "" : "s"
        } available for size ${normalizedSize}`
      );
    }

    existingItem.quantity = newQuantity;
  } else {
    if (requestedQuantity > availableStock) {
      throw new Error(
        `Only ${availableStock} item${
          availableStock === 1 ? "" : "s"
        } available for size ${normalizedSize}`
      );
    }

    cart.items.push({
      product: product._id,
      size: normalizedSize,
      quantity: requestedQuantity,
    });
  }

  await cart.save();

  return getCart(userId);
};

const getCart = async (userId) => {
  const cart = await Cart.findOne({
    user: userId,
  })
    .populate({
      path: "items.product",
      select:
        "name images price discountPrice stock sizes isActive isDeleted",
    })
    .lean();

  if (!cart) {
    return {
      _id: null,
      user: userId,
      items: [],
    };
  }

  const validItems = [];

  for (const item of cart.items) {
    const product = item.product;

    if (
      !product ||
      product.isDeleted ||
      !product.isActive
    ) {
      continue;
    }

    const availableStock = getSizeStock(
      product,
      item.size
    );

    if (availableStock <= 0) {
      continue;
    }

    const safeQuantity = Math.min(
      item.quantity,
      availableStock
    );

    if (safeQuantity <= 0) {
      continue;
    }

    validItems.push({
      _id: item._id,
      product,
      size: item.size,
      quantity: safeQuantity,
      price: getProductPrice(product),
      lineTotal:
        getProductPrice(product) *
        safeQuantity,
    });
  }

  const subtotal = validItems.reduce(
    (total, item) =>
      total + item.lineTotal,
    0
  );

  return {
    _id: cart._id,
    user: cart.user,
    items: validItems,
    itemCount: validItems.reduce(
      (total, item) =>
        total + item.quantity,
      0
    ),
    subtotal,
  };
};

const updateCartItem = async (
  userId,
  itemId,
  quantity
) => {
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new Error("Invalid cart item ID");
  }

  const requestedQuantity = Number(quantity);

  if (
    !Number.isInteger(requestedQuantity) ||
    requestedQuantity < 1
  ) {
    throw new Error(
      "Quantity must be a positive integer"
    );
  }

  const cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  const item = cart.items.id(itemId);

  if (!item) {
    throw new Error("Cart item not found");
  }

  const product = await validateProduct(
    item.product
  );

  const availableStock = getSizeStock(
    product,
    item.size
  );

  if (availableStock <= 0) {
    throw new Error(
      `Size ${item.size} is out of stock`
    );
  }

  if (requestedQuantity > availableStock) {
    throw new Error(
      `Only ${availableStock} item${
        availableStock === 1 ? "" : "s"
      } available for size ${item.size}`
    );
  }

  item.quantity = requestedQuantity;

  await cart.save();

  return getCart(userId);
};

const removeFromCart = async (
  userId,
  itemId
) => {
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new Error("Invalid cart item ID");
  }

  const cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  const item = cart.items.id(itemId);

  if (!item) {
    throw new Error("Cart item not found");
  }

  cart.items.pull(itemId);

  await cart.save();

  return getCart(userId);
};

const clearCart = async (userId) => {
  const cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    return {
      _id: null,
      user: userId,
      items: [],
      itemCount: 0,
      subtotal: 0,
    };
  }

  cart.items = [];

  await cart.save();

  return {
    _id: cart._id,
    user: cart.user,
    items: [],
    itemCount: 0,
    subtotal: 0,
  };
};

export {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};