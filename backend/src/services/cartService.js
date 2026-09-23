// backend/src/services/cartService.js

import mongoose from "mongoose";

import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

import {
  removeProductFromWishlist,
} from "./wishlistService.js";

/*
|--------------------------------------------------------------------------
| PRODUCT PRICE
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| SIZE STOCK
|--------------------------------------------------------------------------
*/

const getSizeStock = (
  product,
  size
) => {
  if (
    Array.isArray(product.sizes) &&
    product.sizes.length > 0
  ) {
    const sizeEntry =
      product.sizes.find(
        (item) =>
          item.size === size
      );

    if (!sizeEntry) {
      return 0;
    }

    return Number(
      sizeEntry.stock || 0
    );
  }

  return Number(
    product.stock || 0
  );
};

/*
|--------------------------------------------------------------------------
| VALIDATE PRODUCT
|--------------------------------------------------------------------------
*/

const validateProduct = async (
  productId
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      productId
    )
  ) {
    throw new Error(
      "Invalid product ID"
    );
  }

  const product =
    await Product.findOne({
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

/*
|--------------------------------------------------------------------------
| GET OR CREATE CART
|--------------------------------------------------------------------------
*/

const getOrCreateCart = async (
  userId
) => {
  let cart =
    await Cart.findOne({
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

/*
|--------------------------------------------------------------------------
| ADD TO CART
|--------------------------------------------------------------------------
*/

const addToCart = async (
  userId,
  productId,
  size,
  quantity
) => {
  const product =
    await validateProduct(
      productId
    );

  const normalizedSize =
    size?.trim();

  if (!normalizedSize) {
    throw new Error(
      "Please select a size"
    );
  }

  const requestedQuantity =
    Number(quantity);

  if (
    !Number.isInteger(
      requestedQuantity
    ) ||
    requestedQuantity < 1
  ) {
    throw new Error(
      "Quantity must be a positive integer"
    );
  }

  const availableStock =
    getSizeStock(
      product,
      normalizedSize
    );

  if (availableStock <= 0) {
    throw new Error(
      `Size ${normalizedSize} is out of stock`
    );
  }

  const cart =
    await getOrCreateCart(
      userId
    );

  const existingItem =
    cart.items.find(
      (item) =>
        item.product.toString() ===
          productId.toString() &&
        item.size ===
          normalizedSize
    );

  if (existingItem) {
    const newQuantity =
      existingItem.quantity +
      requestedQuantity;

    if (
      newQuantity >
      availableStock
    ) {
      throw new Error(
        `Only ${availableStock} item${
          availableStock === 1
            ? ""
            : "s"
        } available for size ${normalizedSize}`
      );
    }

    existingItem.quantity =
      newQuantity;
  } else {
    if (
      requestedQuantity >
      availableStock
    ) {
      throw new Error(
        `Only ${availableStock} item${
          availableStock === 1
            ? ""
            : "s"
        } available for size ${normalizedSize}`
      );
    }

    cart.items.push({
      product:
        product._id,
      size:
        normalizedSize,
      quantity:
        requestedQuantity,
    });
  }

  await cart.save();

  /*
   * Remove product from wishlist
   * only after cart save succeeds.
   */
  await removeProductFromWishlist(
    userId,
    product._id
  );

  return getCart(userId);
};

/*
|--------------------------------------------------------------------------
| GET CART
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| Do NOT silently remove unavailable products
| from the response.
|
| A product can become unavailable after
| being added to the cart.
|
| The frontend needs to know about that item
| so it can:
|
| 1. Display "Out of Stock"
| 2. Disable quantity controls
| 3. Prevent checkout
| 4. Ask the user to remove the item
|
|--------------------------------------------------------------------------
*/

const getCart = async (
  userId
) => {
  const cart =
    await Cart.findOne({
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
      itemCount: 0,
      subtotal: 0,
      hasUnavailableItems:
        false,
      unavailableItemCount: 0,
    };
  }

  const validItems = [];

  let unavailableItemCount =
    0;

  let totalItemCount = 0;

  for (const item of cart.items) {
    const product =
      item.product;

    /*
     * Product was deleted or deactivated.
     */
    if (
      !product ||
      product.isDeleted ||
      !product.isActive
    ) {
      unavailableItemCount += 1;

      totalItemCount +=
        Number(
          item.quantity || 0
        );

      validItems.push({
        _id: item._id,
        product,
        size: item.size,
        quantity:
          item.quantity,
        price: 0,
        lineTotal: 0,

        isAvailable: false,

        availableStock: 0,

        availabilityMessage:
          "This product is no longer available",
      });

      continue;
    }

    /*
     * Get the latest stock from Product.
     */
    const availableStock =
      getSizeStock(
        product,
        item.size
      );

    /*
     * Product/size has no stock.
     */
    if (
      availableStock <= 0
    ) {
      unavailableItemCount += 1;

      totalItemCount +=
        Number(
          item.quantity || 0
        );

      validItems.push({
        _id: item._id,
        product,
        size: item.size,
        quantity:
          item.quantity,
        price:
          getProductPrice(
            product
          ),
        lineTotal: 0,

        isAvailable: false,

        availableStock: 0,

        availabilityMessage:
          `Size ${item.size} is currently out of stock`,
      });

      continue;
    }

    /*
     * Cart quantity may be greater than
     * the stock that is currently available.
     */
    if (
      item.quantity >
      availableStock
    ) {
      unavailableItemCount += 1;

      totalItemCount +=
        Number(
          item.quantity || 0
        );

      validItems.push({
        _id: item._id,
        product,
        size: item.size,
        quantity:
          item.quantity,
        price:
          getProductPrice(
            product
          ),
        lineTotal: 0,

        isAvailable: false,

        availableStock,

        availabilityMessage:
          `Only ${availableStock} item${
            availableStock === 1
              ? ""
              : "s"
          } currently available for size ${item.size}`,
      });

      continue;
    }

    /*
     * Normal available cart item.
     */
    const price =
      getProductPrice(
        product
      );

    const lineTotal =
      price *
      item.quantity;

    validItems.push({
      _id: item._id,
      product,
      size: item.size,
      quantity:
        item.quantity,
      price,
      lineTotal,

      isAvailable: true,

      availableStock,

      availabilityMessage: "",
    });

    totalItemCount +=
      Number(
        item.quantity || 0
      );
  }

  /*
   * Only available products are included
   * in the checkout subtotal.
   */
  const subtotal =
    validItems.reduce(
      (total, item) => {
        if (
          !item.isAvailable
        ) {
          return total;
        }

        return (
          total +
          item.lineTotal
        );
      },
      0
    );

  return {
    _id: cart._id,

    user: cart.user,

    items: validItems,

    /*
     * Keep the complete cart quantity.
     */
    itemCount:
      totalItemCount,

    subtotal,

    /*
     * Checkout can use this flag.
     */
    hasUnavailableItems:
      unavailableItemCount >
      0,

    unavailableItemCount,
  };
};

/*
|--------------------------------------------------------------------------
| UPDATE CART ITEM
|--------------------------------------------------------------------------
*/

const updateCartItem = async (
  userId,
  itemId,
  quantity
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      itemId
    )
  ) {
    throw new Error(
      "Invalid cart item ID"
    );
  }

  const requestedQuantity =
    Number(quantity);

  if (
    !Number.isInteger(
      requestedQuantity
    ) ||
    requestedQuantity < 1
  ) {
    throw new Error(
      "Quantity must be a positive integer"
    );
  }

  const cart =
    await Cart.findOne({
      user: userId,
    });

  if (!cart) {
    throw new Error(
      "Cart not found"
    );
  }

  const item =
    cart.items.id(itemId);

  if (!item) {
    throw new Error(
      "Cart item not found"
    );
  }

  const product =
    await validateProduct(
      item.product
    );

  const availableStock =
    getSizeStock(
      product,
      item.size
    );

  if (
    availableStock <= 0
  ) {
    throw new Error(
      `Size ${item.size} is out of stock`
    );
  }

  if (
    requestedQuantity >
    availableStock
  ) {
    throw new Error(
      `Only ${availableStock} item${
        availableStock === 1
          ? ""
          : "s"
      } available for size ${item.size}`
    );
  }

  item.quantity =
    requestedQuantity;

  await cart.save();

  return getCart(userId);
};

/*
|--------------------------------------------------------------------------
| REMOVE FROM CART
|--------------------------------------------------------------------------
*/

const removeFromCart = async (
  userId,
  itemId
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      itemId
    )
  ) {
    throw new Error(
      "Invalid cart item ID"
    );
  }

  const cart =
    await Cart.findOne({
      user: userId,
    });

  if (!cart) {
    throw new Error(
      "Cart not found"
    );
  }

  const item =
    cart.items.id(itemId);

  if (!item) {
    throw new Error(
      "Cart item not found"
    );
  }

  cart.items.pull(
    itemId
  );

  await cart.save();

  return getCart(userId);
};

/*
|--------------------------------------------------------------------------
| CLEAR CART
|--------------------------------------------------------------------------
*/

const clearCart = async (
  userId
) => {
  const cart =
    await Cart.findOne({
      user: userId,
    });

  if (!cart) {
    return {
      _id: null,
      user: userId,
      items: [],
      itemCount: 0,
      subtotal: 0,
      hasUnavailableItems:
        false,
      unavailableItemCount: 0,
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
    hasUnavailableItems:
      false,
    unavailableItemCount: 0,
  };
};

/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

export {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};