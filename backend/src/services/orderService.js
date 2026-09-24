import mongoose from "mongoose";

import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Address from "../models/Address.js";
import Product from "../models/Product.js";

import {
  reserveCouponUsage,
  rollbackCouponUsage,
} from "./couponRulesService.js";

const SHIPPING_CHARGE = 0;

const TAX_RATE = 0;

/*
|----------------------------------------------------------------------
| GENERATE ORDER ID
|----------------------------------------------------------------------
*/

const generateOrderId = () => {
  const timestamp = Date.now().toString().slice(-8);

  const randomPart = Math.floor(1000 + Math.random() * 9000);

  return `UT-${timestamp}-${randomPart}`;
};

/*
|----------------------------------------------------------------------
| PRODUCT PRICE
|----------------------------------------------------------------------
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
|----------------------------------------------------------------------
| SIZE STOCK
|----------------------------------------------------------------------
*/

const getSizeStock = (product, size) => {
  if (Array.isArray(product.sizes) && product.sizes.length > 0) {
    const sizeEntry = product.sizes.find((item) => item.size === size);

    if (!sizeEntry) {
      throw new Error(`Size ${size} is not available for ${product.name}`);
    }

    return sizeEntry.stock;
  }

  return product.stock;
};

/*
|----------------------------------------------------------------------
| PRODUCT IMAGE
|----------------------------------------------------------------------
*/

const getProductImage = (product) => {
  if (!Array.isArray(product.images) || product.images.length === 0) {
    return "";
  }

  return product.images[0]?.url || "";
};

/*
|----------------------------------------------------------------------
| VALIDATE ADDRESS
|----------------------------------------------------------------------
*/

const getValidatedAddress = async (userId, addressId) => {
  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new Error("Invalid address ID");
  }

  const address = await Address.findOne({
    _id: addressId,
    user: userId,
  }).lean();

  if (!address) {
    throw new Error("Selected address was not found");
  }

  return address;
};

/*
|----------------------------------------------------------------------
| GET CART
|----------------------------------------------------------------------
*/

const getCartForOrder = async (userId) => {
  const cart = await Cart.findOne({
    user: userId,
  }).populate({
    path: "items.product",

    select: "name images price discountPrice stock sizes isActive isDeleted",
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Your cart is empty");
  }

  return cart;
};

/*
|----------------------------------------------------------------------
| PREPARE ORDER ITEMS
|----------------------------------------------------------------------
*/

const validateAndPrepareItems = (cart) => {
  const preparedItems = [];

  for (const cartItem of cart.items) {
    const product = cartItem.product;

    if (!product) {
      throw new Error(
        "One of the products in your cart is no longer available",
      );
    }

    if (product.isDeleted || !product.isActive) {
      throw new Error(`${product.name} is no longer available`);
    }

    const availableStock = getSizeStock(product, cartItem.size);

    if (availableStock <= 0) {
      throw new Error(`${product.name} (${cartItem.size}) is out of stock`);
    }

    if (cartItem.quantity > availableStock) {
      throw new Error(
        `Only ${availableStock} item${
          availableStock === 1 ? "" : "s"
        } of ${product.name} (${cartItem.size}) are available`,
      );
    }

    const price = getProductPrice(product);

    const discount = Math.max(
      Number(product.price || 0) - Number(price || 0),

      0,
    );

    const itemTotal = Number(
      (Number(price) * Number(cartItem.quantity)).toFixed(2),
    );

    preparedItems.push({
      product: product._id,

      productName: product.name,

      productImage: getProductImage(product),

      size: cartItem.size,

      quantity: cartItem.quantity,

      price: Number(price),

      discount: Number(discount),

      itemTotal,

      itemStatus: "Active",

      cancellationReason: "",

      cancelledAt: null,
    });
  }

  return preparedItems;
};

/*
|----------------------------------------------------------------------
| CALCULATE ORDER TOTALS
|----------------------------------------------------------------------
*/

const calculateOrderTotals = (items) => {
  const subtotal = items.reduce(
    (total, item) => total + Number(item.itemTotal || 0),

    0,
  );

  const discount = items.reduce(
    (total, item) =>
      total + Number(item.discount || 0) * Number(item.quantity || 0),

    0,
  );

  const shippingCharge = SHIPPING_CHARGE;

  const taxableAmount = Math.max(
    subtotal - discount,

    0,
  );

  const tax = Number((taxableAmount * TAX_RATE).toFixed(2));

  const totalAmount = Number((taxableAmount + shippingCharge + tax).toFixed(2));

  return {
    subtotal: Number(subtotal.toFixed(2)),

    discount: Number(discount.toFixed(2)),

    shippingCharge,

    tax,

    totalAmount,
  };
};

/*
|----------------------------------------------------------------------
| REDUCE PRODUCT STOCK
|----------------------------------------------------------------------
*/

const reduceProductStock = async (preparedItems) => {
  const reducedItems = [];

  try {
    for (const item of preparedItems) {
      const product = await Product.findById(item.product);

      if (!product) {
        throw new Error(`${item.productName} is no longer available`);
      }

      if (product.isDeleted || !product.isActive) {
        throw new Error(`${product.name} is no longer available`);
      }

      if (Array.isArray(product.sizes) && product.sizes.length > 0) {
        const sizeEntry = product.sizes.find((size) => size.size === item.size);

        if (!sizeEntry) {
          throw new Error(
            `Size ${item.size} is no longer available for ${product.name}`,
          );
        }

        if (sizeEntry.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name} (${item.size})`,
          );
        }

        sizeEntry.stock -= item.quantity;

        product.stock = product.sizes.reduce(
          (total, size) => total + size.stock,

          0,
        );
      } else {
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        product.stock -= item.quantity;
      }

      await product.save();

      reducedItems.push({
        productId: product._id,

        size: item.size,

        quantity: item.quantity,
      });
    }

    return reducedItems;
  } catch (error) {
    await restoreProductStock(reducedItems);

    throw error;
  }
};

/*
|----------------------------------------------------------------------
| RESTORE PRODUCT STOCK
|----------------------------------------------------------------------
*/

const restoreProductStock = async (items) => {
  const restoredItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);

    if (!product) {
      continue;
    }

    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      const sizeEntry = product.sizes.find((size) => size.size === item.size);

      if (sizeEntry) {
        sizeEntry.stock += item.quantity;

        product.stock = product.sizes.reduce(
          (total, size) => total + size.stock,

          0,
        );
      }
    } else {
      product.stock += item.quantity;
    }

    await product.save();

    restoredItems.push({
      productId: product._id,

      size: item.size,

      quantity: item.quantity,
    });
  }

  return restoredItems;
};

/*
|----------------------------------------------------------------------
| CREATE ORDER
|----------------------------------------------------------------------
*/

const createOrder = async (userId, addressId, couponCode = "") => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const address = await getValidatedAddress(userId, addressId);

  const cart = await getCartForOrder(userId);

  const preparedItems = validateAndPrepareItems(cart);

  const totals = calculateOrderTotals(preparedItems);

  /*
   * Reserve the selected coupon only while creating the order.
   * The backend remains the source of truth for coupon eligibility.
   */
  let couponReservation = null;

  if (couponCode?.trim()) {
    couponReservation = await reserveCouponUsage(couponCode, totals.subtotal);
  }

  let createdOrder = null;

  try {
    const orderData = {
      orderId: generateOrderId(),

      user: userId,

      items: preparedItems,

      shippingAddress: {
        fullName: address.fullName,

        phone: address.phone,

        houseName: address.houseName,

        street: address.street,

        city: address.city,

        state: address.state,

        pincode: address.pincode,

        country: address.country,

        addressType: address.addressType,
      },

      paymentMethod: "COD",

      paymentStatus: "Pending",

      orderStatus: "Pending",

      subtotal: totals.subtotal,

      discount: totals.discount,

      shippingCharge: totals.shippingCharge,

      tax: totals.tax,

      couponCode: couponReservation?.coupon?.code || "",

      couponDiscount: couponReservation?.discountAmount || 0,

      totalAmount: Number(
        (totals.totalAmount - (couponReservation?.discountAmount || 0)).toFixed(
          2,
        ),
      ),
    };

    createdOrder = await Order.create(orderData);

    let reducedItems = [];

    try {
      reducedItems = await reduceProductStock(preparedItems);

      cart.items = [];

      await cart.save();
    } catch (error) {
      if (reducedItems.length > 0) {
        await restoreProductStock(reducedItems);
      }

      await Order.findByIdAndDelete(createdOrder._id);

      if (couponReservation) {
        await rollbackCouponUsage(couponReservation.coupon.code);

        couponReservation = null;
      }

      throw error;
    }

    const finalOrder = await Order.findById(createdOrder._id)
      .populate("user", "name email")
      .lean();

    return finalOrder;
  } catch (error) {
    if (couponReservation && !createdOrder) {
      await rollbackCouponUsage(couponReservation.coupon.code);
    }

    throw error;
  }
};

/*
|----------------------------------------------------------------------
| GET USER ORDERS
|----------------------------------------------------------------------
*/

const getUserOrders = async (userId, search = "") => {
  const query = {
    user: userId,
  };

  const trimmedSearch = search.trim();

  if (trimmedSearch) {
    query.$or = [
      {
        orderId: {
          $regex: trimmedSearch,

          $options: "i",
        },
      },

      {
        orderStatus: {
          $regex: trimmedSearch,

          $options: "i",
        },
      },
    ];
  }

  return Order.find(query)
    .sort({
      createdAt: -1,
    })
    .lean();
};

/*
|----------------------------------------------------------------------
| GET SINGLE USER ORDER
|----------------------------------------------------------------------
*/

const getUserOrderById = async (userId, orderId) => {
  let order = null;

  if (mongoose.Types.ObjectId.isValid(orderId)) {
    order = await Order.findOne({
      _id: orderId,

      user: userId,
    }).lean();
  }

  if (!order) {
    order = await Order.findOne({
      orderId,

      user: userId,
    }).lean();
  }

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
};

/*
|----------------------------------------------------------------------
| CHECK ACTIVE ORDER ITEM
|----------------------------------------------------------------------
*/

const isActiveOrderItem = (item) => {
  return !item.itemStatus || item.itemStatus === "Active";
};

/*
|----------------------------------------------------------------------
| CALCULATE ACTIVE ORDER TOTALS
|----------------------------------------------------------------------
*/

const calculateActiveOrderTotals = (order) => {
  const activeItems = order.items.filter((item) => isActiveOrderItem(item));

  const subtotal = activeItems.reduce(
    (total, item) => total + Number(item.itemTotal || 0),

    0,
  );

  const discount = activeItems.reduce(
    (total, item) =>
      total + Number(item.discount || 0) * Number(item.quantity || 0),

    0,
  );

  const shippingCharge = activeItems.length > 0 ? SHIPPING_CHARGE : 0;

  const taxableAmount = Math.max(
    subtotal - discount,

    0,
  );

  const tax = Number((taxableAmount * TAX_RATE).toFixed(2));

  const totalAmount = Number((taxableAmount + shippingCharge + tax).toFixed(2));

  return {
    subtotal: Number(subtotal.toFixed(2)),

    discount: Number(discount.toFixed(2)),

    shippingCharge,

    tax,

    totalAmount,
  };
};

/*
|----------------------------------------------------------------------
| CANCEL USER ORDER
|----------------------------------------------------------------------
*/

const cancelUserOrder = async (userId, orderId, reason = "") => {
  const trimmedReason = reason.trim();

  let order = null;

  if (mongoose.Types.ObjectId.isValid(orderId)) {
    order = await Order.findOne({
      _id: orderId,

      user: userId,
    });
  }

  if (!order) {
    order = await Order.findOne({
      orderId,

      user: userId,
    });
  }

  if (!order) {
    throw new Error("Order not found");
  }

  if (!["Pending", "Partially Cancelled"].includes(order.orderStatus)) {
    throw new Error("This order can no longer be cancelled");
  }

  const activeItems = order.items.filter((item) => isActiveOrderItem(item));

  if (activeItems.length === 0) {
    throw new Error("All products in this order are already cancelled");
  }

  const stockItems = activeItems.map((item) => ({
    productId: item.product,

    size: item.size,

    quantity: item.quantity,
  }));

  let restoredItems = [];

  try {
    restoredItems = await restoreProductStock(stockItems);

    const currentOrder = await Order.findOne({
      _id: order._id,

      user: userId,
    });

    if (!currentOrder) {
      throw new Error("Order not found");
    }

    if (
      !["Pending", "Partially Cancelled"].includes(currentOrder.orderStatus)
    ) {
      throw new Error("This order can no longer be cancelled");
    }

    const cancellationDate = new Date();

    currentOrder.items.forEach((item) => {
      if (isActiveOrderItem(item)) {
        item.itemStatus = "Cancelled";

        item.cancellationReason = trimmedReason;

        item.cancelledAt = cancellationDate;
      }
    });

    currentOrder.orderStatus = "Cancelled";

    currentOrder.cancellationReason = trimmedReason;

    currentOrder.cancelledAt = cancellationDate;

    const totals = calculateActiveOrderTotals(currentOrder);

    currentOrder.subtotal = totals.subtotal;

    currentOrder.discount = totals.discount;

    currentOrder.shippingCharge = totals.shippingCharge;

    currentOrder.tax = totals.tax;

    currentOrder.totalAmount = totals.totalAmount;

    await currentOrder.save();

    return currentOrder.toObject();
  } catch (error) {
    if (restoredItems.length > 0) {
      await reduceProductStock(
        restoredItems.map((item) => ({
          product: item.productId,

          productName: "",

          size: item.size,

          quantity: item.quantity,
        })),
      );
    }

    throw error;
  }
};

/*
|----------------------------------------------------------------------
| CANCEL USER ORDER ITEM
|----------------------------------------------------------------------
*/

const cancelUserOrderItem = async (userId, orderId, itemId, reason = "") => {
  const trimmedReason = reason.trim();

  let order = null;

  if (mongoose.Types.ObjectId.isValid(orderId)) {
    order = await Order.findOne({
      _id: orderId,

      user: userId,
    });
  }

  if (!order) {
    order = await Order.findOne({
      orderId,

      user: userId,
    });
  }

  if (!order) {
    throw new Error("Order not found");
  }

  if (!["Pending", "Partially Cancelled"].includes(order.orderStatus)) {
    throw new Error("This product can no longer be cancelled");
  }

  const orderItem = order.items.find((item) => item._id.toString() === itemId);

  if (!orderItem) {
    throw new Error("Order item not found");
  }

  if (!isActiveOrderItem(orderItem)) {
    throw new Error("This product is already cancelled");
  }

  const stockItem = {
    productId: orderItem.product,

    size: orderItem.size,

    quantity: orderItem.quantity,
  };

  let restoredItems = [];

  try {
    /*
     * Restore stock only for this
     * selected product/size.
     */
    restoredItems = await restoreProductStock([stockItem]);

    const currentOrder = await Order.findOne({
      _id: order._id,

      user: userId,
    });

    if (!currentOrder) {
      throw new Error("Order not found");
    }

    if (
      !["Pending", "Partially Cancelled"].includes(currentOrder.orderStatus)
    ) {
      throw new Error("This product can no longer be cancelled");
    }

    const currentItem = currentOrder.items.find(
      (item) => item._id.toString() === itemId,
    );

    if (!currentItem) {
      throw new Error("Order item not found");
    }

    if (!isActiveOrderItem(currentItem)) {
      throw new Error("This product is already cancelled");
    }

    const cancellationDate = new Date();

    currentItem.itemStatus = "Cancelled";

    currentItem.cancellationReason = trimmedReason;

    currentItem.cancelledAt = cancellationDate;

    const hasActiveItems = currentOrder.items.some((item) =>
      isActiveOrderItem(item),
    );

    if (hasActiveItems) {
      currentOrder.orderStatus = "Partially Cancelled";

      currentOrder.cancellationReason = "";

      currentOrder.cancelledAt = null;
    } else {
      currentOrder.orderStatus = "Cancelled";

      currentOrder.cancellationReason = trimmedReason;

      currentOrder.cancelledAt = cancellationDate;
    }

    const totals = calculateActiveOrderTotals(currentOrder);

    currentOrder.subtotal = totals.subtotal;

    currentOrder.discount = totals.discount;

    currentOrder.shippingCharge = totals.shippingCharge;

    currentOrder.tax = totals.tax;

    currentOrder.totalAmount = totals.totalAmount;

    await currentOrder.save();

    return currentOrder.toObject();
  } catch (error) {
    /*
     * If stock was restored but
     * updating the order failed,
     * reduce the same stock again.
     */
    if (restoredItems.length > 0) {
      await reduceProductStock(
        restoredItems.map((item) => ({
          product: item.productId,

          productName: "",

          size: item.size,

          quantity: item.quantity,
        })),
      );
    }

    throw error;
  }
};

export {
  createOrder,
  getUserOrders,
  getUserOrderById,
  cancelUserOrder,
  cancelUserOrderItem,
};
