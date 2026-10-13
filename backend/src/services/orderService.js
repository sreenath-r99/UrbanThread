import mongoose from "mongoose";
import PDFDocument from "pdfkit";

import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Address from "../models/Address.js";
import Product from "../models/Product.js";

import Coupon from "../models/Coupon.js";

import {
  reserveCouponUsage,
  rollbackCouponUsage,
} from "./couponRulesService.js";

const SHIPPING_CHARGE = 0;
const TAX_RATE = 0;

/*
|--------------------------------------------------------------------------
| GENERATE ORDER ID
|--------------------------------------------------------------------------
*/

const generateOrderId = () => {
  const timestamp = Date.now().toString().slice(-8);
  const randomPart = Math.floor(1000 + Math.random() * 9000);

  return `UT-${timestamp}-${randomPart}`;
};

/*
|--------------------------------------------------------------------------
| PRODUCT PRICE
|--------------------------------------------------------------------------
*/

const getProductPrice = (product) => {
  const originalPrice = Math.max(Number(product.price || 0), 0);

  if (
    product.discountPrice !== null &&
    product.discountPrice !== undefined &&
    Number(product.discountPrice) < originalPrice
  ) {
    return Math.max(Number(product.discountPrice), 0);
  }

  return originalPrice;
};

/*
|--------------------------------------------------------------------------
| SIZE STOCK
|--------------------------------------------------------------------------
*/

const getSizeStock = (product, size) => {
  if (Array.isArray(product.sizes) && product.sizes.length > 0) {
    const sizeEntry = product.sizes.find((item) => item.size === size);

    if (!sizeEntry) {
      throw new Error(`Size ${size} is not available for ${product.name}`);
    }

    return Number(sizeEntry.stock || 0);
  }

  return Number(product.stock || 0);
};

/*
|--------------------------------------------------------------------------
| PRODUCT IMAGE
|--------------------------------------------------------------------------
*/

const getProductImage = (product) => {
  if (!Array.isArray(product.images) || product.images.length === 0) {
    return "";
  }

  return product.images[0]?.url || "";
};

/*
|--------------------------------------------------------------------------
| MONEY HELPERS
|--------------------------------------------------------------------------
*/

const roundMoney = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Number(amount.toFixed(2));
};

const nonNegativeMoney = (value) => {
  return roundMoney(Math.max(Number(value) || 0, 0));
};

/*
|--------------------------------------------------------------------------
| VALIDATE ADDRESS
|--------------------------------------------------------------------------
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
|--------------------------------------------------------------------------
| GET CART
|--------------------------------------------------------------------------
*/

const getCartForOrder = async (userId) => {
  const cart = await Cart.findOne({
    user: userId,
  }).populate({
    path: "items.product",
    select:
      "name images price discountPrice stock sizes isActive isDeleted",
  });

  if (!cart || !cart.items || cart.items.length === 0) {
    throw new Error("Your cart is empty");
  }

  return cart;
};

/*
|--------------------------------------------------------------------------
| PREPARE ORDER ITEMS
|--------------------------------------------------------------------------
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

    const quantity = Number(cartItem.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error(`Invalid quantity for ${product.name}`);
    }

    const availableStock = Number(
      getSizeStock(product, cartItem.size) || 0,
    );

    if (availableStock <= 0) {
      throw new Error(
        `${product.name} (${cartItem.size}) is out of stock`,
      );
    }

    if (quantity > availableStock) {
      throw new Error(
        `Only ${availableStock} item${
          availableStock === 1 ? "" : "s"
        } of ${product.name} (${cartItem.size}) are available`,
      );
    }

    const originalPrice = Math.max(
      Number(product.price || 0),
      0,
    );

    const sellingPrice = Math.min(
      Math.max(Number(getProductPrice(product) || 0), 0),
      originalPrice,
    );

    // Discount is the discount for ONE unit.
    const discount = Number(
      Math.max(originalPrice - sellingPrice, 0).toFixed(2),
    );

    // itemTotal is the discounted line total for ALL units.
    const itemTotal = Number(
      (sellingPrice * quantity).toFixed(2),
    );

    preparedItems.push({
      product: product._id,
      productName: product.name,
      productImage: getProductImage(product),
      size: cartItem.size,
      quantity,

      // Keep the original price here.
      price: originalPrice,

      // Store the per-unit product discount.
      discount,

      // Keep the post-discount line total.
      itemTotal,

      itemStatus: "Active",
      cancellationReason: "",
      cancelledAt: null,
      returnStatus: "Not Requested",
      returnReason: "",
      returnRequestedAt: null,
    });
  }

  return preparedItems;
};

/*
|--------------------------------------------------------------------------
| CALCULATE ORDER TOTALS
|--------------------------------------------------------------------------
*/

const calculateOrderTotals = (items) => {
  const roundMoney = (value) =>
    Number(Math.max(Number(value) || 0, 0).toFixed(2));

  // Original price × quantity.
  const subtotal = roundMoney(
    items.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
          Number(item.quantity || 0),
      0,
    ),
  );

  // Per-unit discount × quantity.
  const discount = roundMoney(
    items.reduce((total, item) => {
      const unitPrice = Math.max(Number(item.price || 0), 0);
      const unitDiscount = Math.min(
        Math.max(Number(item.discount || 0), 0),
        unitPrice,
      );

      return total + unitDiscount * Number(item.quantity || 0);
    }, 0),
  );

  const safeDiscount = Math.min(discount, subtotal);

  // Coupon eligibility starts AFTER product discounts.
  const eligibleSubtotal = roundMoney(
    Math.max(subtotal - safeDiscount, 0),
  );

  const shippingCharge = Number(SHIPPING_CHARGE || 0);

  const tax = roundMoney(
    eligibleSubtotal * Number(TAX_RATE || 0),
  );

  const totalAmount = roundMoney(
    eligibleSubtotal + shippingCharge + tax,
  );

  return {
    subtotal,
    discount: safeDiscount,
    eligibleSubtotal,
    shippingCharge,
    tax,
    totalAmount,
  };
};

/*
|--------------------------------------------------------------------------
| REDUCE PRODUCT STOCK
|--------------------------------------------------------------------------
*/

const reduceProductStock = async (preparedItems) => {
  const reducedItems = [];

  try {
    for (const item of preparedItems) {
      const product = await Product.findById(item.product);

      if (!product) {
        throw new Error(
          `${item.productName} is no longer available`,
        );
      }

      if (product.isDeleted || !product.isActive) {
        throw new Error(`${product.name} is no longer available`);
      }

      if (
        Array.isArray(product.sizes) &&
        product.sizes.length > 0
      ) {
        const sizeEntry = product.sizes.find(
          (size) => size.size === item.size,
        );

        if (!sizeEntry) {
          throw new Error(
            `Size ${item.size} is no longer available for ${product.name}`,
          );
        }

        if (Number(sizeEntry.stock) < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name} (${item.size})`,
          );
        }

        sizeEntry.stock -= item.quantity;

        product.stock = product.sizes.reduce(
          (total, size) => total + Number(size.stock || 0),
          0,
        );
      } else {
        if (Number(product.stock || 0) < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}`,
          );
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
|--------------------------------------------------------------------------
| RESTORE PRODUCT STOCK
|--------------------------------------------------------------------------
*/

const restoreProductStock = async (items) => {
  const restoredItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);

    if (!product) {
      continue;
    }

    if (
      Array.isArray(product.sizes) &&
      product.sizes.length > 0
    ) {
      const sizeEntry = product.sizes.find(
        (size) => size.size === item.size,
      );

      if (sizeEntry) {
        sizeEntry.stock =
          Number(sizeEntry.stock || 0) + Number(item.quantity || 0);

        product.stock = product.sizes.reduce(
          (total, size) => total + Number(size.stock || 0),
          0,
        );
      }
    } else {
      product.stock =
        Number(product.stock || 0) + Number(item.quantity || 0);
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
|--------------------------------------------------------------------------
| CREATE ORDER
|--------------------------------------------------------------------------
*/

const createOrder = async (
  userId,
  addressId,
  couponCode = "",
) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const address = await getValidatedAddress(
    userId,
    addressId,
  );

  const cart = await getCartForOrder(userId);
  const preparedItems = validateAndPrepareItems(cart);
  const totals = calculateOrderTotals(preparedItems);

  let couponReservation = null;
  let createdOrder = null;

  try {
    /*
     * Reserve coupon usage using the eligible subtotal
     * after product discounts.
     */
    if (
      typeof couponCode === "string" &&
      couponCode.trim()
    ) {
      couponReservation = await reserveCouponUsage(
        couponCode.trim(),
        totals.eligibleSubtotal,
      );
    }

    /*
     * Prevent negative or excessive coupon discounts.
     */
    const requestedCouponDiscount = nonNegativeMoney(
      couponReservation?.discountAmount || 0,
    );

    const couponDiscount = roundMoney(
      Math.min(
        requestedCouponDiscount,
        Math.max(Number(totals.eligibleSubtotal) || 0, 0),
      ),
    );

    /*
     * Final amount:
     * Eligible subtotal - coupon discount
     * + shipping + tax.
     */
    const totalAmount = roundMoney(
      Math.max(
        Number(totals.eligibleSubtotal || 0) -
          couponDiscount +
          Number(totals.shippingCharge || 0) +
          Number(totals.tax || 0),
        0,
      ),
    );

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

      couponCode:
        couponReservation?.coupon?.code || "",

      couponDiscount,
      shippingCharge: totals.shippingCharge,
      tax: totals.tax,
      totalAmount,
    };

    createdOrder = await Order.create(orderData);

    let reducedItems = [];

    try {
      /*
       * Reduce stock only after the order is created.
       */
      reducedItems = await reduceProductStock(
        preparedItems,
      );

      /*
       * Clear the cart after stock reduction succeeds.
       */
      cart.items = [];
      await cart.save();
    } catch (error) {
      /*
       * Roll back any stock reduction that succeeded.
       */
      if (reducedItems.length > 0) {
        await restoreProductStock(reducedItems);
      }

      /*
       * Remove the order because checkout did not finish.
       */
      await Order.findByIdAndDelete(createdOrder._id);

      createdOrder = null;

      throw error;
    }

    /*
     * Return the newly created order with user details.
     */
    const finalOrder = await Order.findById(
      createdOrder._id,
    )
      .populate("user", "name email")
      .lean();

    return finalOrder;
  } catch (error) {
    /*
     * Release reserved coupon usage if order creation
     * or checkout fails.
     */
    if (couponReservation) {
      try {
        await rollbackCouponUsage(
          couponReservation.coupon.code,
        );
      } catch (rollbackError) {
        console.error(
          "COUPON ROLLBACK ERROR:",
          rollbackError,
        );
      }
    }

    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| GET USER ORDERS
|--------------------------------------------------------------------------
*/

const getUserOrders = async (
  userId,
  search = "",
) => {
  const query = {
    user: userId,
  };

  const trimmedSearch = String(search || "").trim();

  if (trimmedSearch) {
    const escapedSearch = trimmedSearch.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );

    query.$or = [
      {
        orderId: {
          $regex: escapedSearch,
          $options: "i",
        },
      },
      {
        orderStatus: {
          $regex: escapedSearch,
          $options: "i",
        },
      },
    ];
  }

  return Order.find(query)
    .sort({ createdAt: -1 })
    .lean();
};

/*
|--------------------------------------------------------------------------
| GET SINGLE USER ORDER
|--------------------------------------------------------------------------
*/

const getUserOrderById = async (
  userId,
  orderId,
) => {
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
|--------------------------------------------------------------------------
| CHECK ACTIVE ORDER ITEM
|--------------------------------------------------------------------------
*/

const isActiveOrderItem = (item) => {
  return !item.itemStatus || item.itemStatus === "Active";
};


/*
|--------------------------------------------------------------------------
| CALCULATE ACTIVE ORDER TOTALS
|--------------------------------------------------------------------------
*/


const calculateActiveOrderTotals = async (order) => {
  const roundMoney = (value) =>
    Number(Math.max(Number(value) || 0, 0).toFixed(2));

  // Only active products contribute to the order totals.
  const activeItems = (order.items || []).filter(
    (item) => isActiveOrderItem(item),
  );

  // item.price is the original unit price.
  // item.discount is the product discount per unit.
  const subtotal = roundMoney(
    activeItems.reduce((sum, item) => {
      const price = Math.max(Number(item.price) || 0, 0);
      const quantity = Math.max(Number(item.quantity) || 0, 0);

      return sum + price * quantity;
    }, 0),
  );

  const discount = roundMoney(
    activeItems.reduce((sum, item) => {
      const price = Math.max(Number(item.price) || 0, 0);
      const quantity = Math.max(Number(item.quantity) || 0, 0);
      const unitDiscount = Math.min(
        Math.max(Number(item.discount) || 0, 0),
        price,
      );

      return sum + unitDiscount * quantity;
    }, 0),
  );

  // Coupon eligibility is based on the amount after product discounts.
  const eligibleSubtotal = roundMoney(
    Math.max(subtotal - discount, 0),
  );

  let couponDiscount = 0;

  // Recalculate using the coupon's actual rules.
  if (activeItems.length > 0 && order.couponCode) {
    const coupon = await Coupon.findOne({
      code: String(order.couponCode).trim().toUpperCase(),
    }).lean();

    if (
      coupon &&
      eligibleSubtotal >= Number(coupon.minOrderAmount || 0)
    ) {
      let calculatedDiscount = 0;

      if (coupon.discountType === "percentage") {
        calculatedDiscount =
          (eligibleSubtotal * Number(coupon.discountValue || 0)) / 100;

        if (
          coupon.maxDiscountAmount !== null &&
          coupon.maxDiscountAmount !== undefined
        ) {
          calculatedDiscount = Math.min(
            calculatedDiscount,
            Number(coupon.maxDiscountAmount),
          );
        }
      } else if (coupon.discountType === "fixed") {
        calculatedDiscount = Number(coupon.discountValue || 0);
      }

      couponDiscount = roundMoney(
        Math.min(
          Math.max(calculatedDiscount, 0),
          eligibleSubtotal,
        ),
      );
    }
  }

  // Preserve the project's current shipping and tax settings.
  const shippingCharge =
    activeItems.length > 0
      ? Math.max(Number(SHIPPING_CHARGE) || 0, 0)
      : 0;

  const taxableAmount = roundMoney(
    Math.max(eligibleSubtotal - couponDiscount, 0),
  );

  const tax = roundMoney(taxableAmount * TAX_RATE);

  const totalAmount = roundMoney(
    taxableAmount + shippingCharge + tax,
  );

  return {
    subtotal,
    discount,
    couponDiscount,
    shippingCharge,
    tax,
    totalAmount,
  };
};

/*
|--------------------------------------------------------------------------
| CANCEL USER ORDER
|--------------------------------------------------------------------------
*/

const cancelUserOrder = async (
  userId,
  orderId,
  reason = "",
) => {
  const trimmedReason = String(reason || "").trim();

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

  if (
    !["Pending", "Partially Cancelled"].includes(
      order.orderStatus,
    )
  ) {
    throw new Error(
      "This order can no longer be cancelled",
    );
  }

  const activeItems = order.items.filter(isActiveOrderItem);

  if (activeItems.length === 0) {
    throw new Error(
      "All products in this order are already cancelled",
    );
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
      !["Pending", "Partially Cancelled"].includes(
        currentOrder.orderStatus,
      )
    ) {
      throw new Error(
        "This order can no longer be cancelled",
      );
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

const totals = await calculateActiveOrderTotals(currentOrder);

    currentOrder.subtotal = totals.subtotal;
    currentOrder.discount = totals.discount;
    currentOrder.couponDiscount = totals.couponDiscount;
    currentOrder.shippingCharge = totals.shippingCharge;
    currentOrder.tax = totals.tax;
    currentOrder.totalAmount = totals.totalAmount;

    await currentOrder.save();

    return currentOrder.toObject();
  } catch (error) {
    /*
     * If cancellation failed after restoring stock,
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

/*
|--------------------------------------------------------------------------
| CANCEL USER ORDER ITEM
|--------------------------------------------------------------------------
*/

const cancelUserOrderItem = async (
  userId,
  orderId,
  itemId,
  reason = "",
) => {
  const trimmedReason = String(reason || "").trim();

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

  if (
    !["Pending", "Partially Cancelled"].includes(
      order.orderStatus,
    )
  ) {
    throw new Error(
      "This product can no longer be cancelled",
    );
  }

  const orderItem = order.items.find(
    (item) => item._id.toString() === itemId,
  );

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
     * Restore stock only for the selected product and size.
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
      !["Pending", "Partially Cancelled"].includes(
        currentOrder.orderStatus,
      )
    ) {
      throw new Error(
        "This product can no longer be cancelled",
      );
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

    const hasActiveItems = currentOrder.items.some(
      (item) => isActiveOrderItem(item),
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

const totals = await calculateActiveOrderTotals(currentOrder);

    currentOrder.subtotal = totals.subtotal;
    currentOrder.discount = totals.discount;
    currentOrder.couponDiscount = totals.couponDiscount;
    currentOrder.shippingCharge = totals.shippingCharge;
    currentOrder.tax = totals.tax;
    currentOrder.totalAmount = totals.totalAmount;

    await currentOrder.save();

    return currentOrder.toObject();
  } catch (error) {
    /*
     * If stock was restored but the order update failed,
     * reduce that stock again.
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

/*
|--------------------------------------------------------------------------
| REQUEST RETURN FOR ORDER ITEM
|--------------------------------------------------------------------------
*/

const requestOrderItemReturn = async (
  userId,
  orderId,
  itemId,
  reason = "",
) => {
  const trimmedReason = String(reason || "").trim();

  if (!trimmedReason) {
    throw new Error("Return reason is required");
  }

  if (trimmedReason.length > 500) {
    throw new Error(
      "Return reason cannot exceed 500 characters",
    );
  }

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

  if (order.orderStatus !== "Delivered") {
    throw new Error(
      "Only delivered orders can be returned",
    );
  }

  const orderItem = order.items.find(
    (item) => item._id.toString() === itemId,
  );

  if (!orderItem) {
    throw new Error("Order item not found");
  }

  if (orderItem.itemStatus === "Cancelled") {
    throw new Error(
      "A cancelled product cannot be returned",
    );
  }

  if (
    orderItem.returnStatus === "Requested"
  ) {
    throw new Error(
      "Return has already been requested for this product",
    );
  }

  if (
    orderItem.returnStatus === "Approved"
  ) {
    throw new Error(
      "This product has already been approved for return",
    );
  }

  orderItem.returnStatus = "Requested";
  orderItem.returnReason = trimmedReason;
  orderItem.returnRequestedAt = new Date();

  await order.save();

  return order.toObject();
};



/*
|--------------------------------------------------------------------------
| GENERATE ORDER INVOICE PDF
|--------------------------------------------------------------------------
*/

const generateOrderInvoicePdf = async (userId, orderId) => {
  const order = await getUserOrderById(userId, orderId);

  // Only active products should appear on the invoice.
  const items = Array.isArray(order.items)
    ? order.items.filter((item) => isActiveOrderItem(item))
    : [];

  const roundMoney = (value) =>
    Number(Math.max(Number(value) || 0, 0).toFixed(2));

  const formatCurrency = (value) =>
    `INR ${Number(value || 0).toFixed(2)}`;

  const formatDateTime = (value) => {
    if (!value) return "—";

    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  /*
   * CALCULATE TOTALS USING ACTIVE ITEMS ONLY
   *
   * Assumptions:
   * - item.price = original unit price
   * - item.discount = per-unit product discount
   * - DIWALI10 = 10% coupon
   */

  const subtotal = roundMoney(
    items.reduce((sum, item) => {
      const quantity = Math.max(Number(item.quantity) || 0, 0);
      const unitPrice = Math.max(Number(item.price) || 0, 0);

      return sum + unitPrice * quantity;
    }, 0)
  );

  const productDiscount = roundMoney(
    items.reduce((sum, item) => {
      const quantity = Math.max(Number(item.quantity) || 0, 0);
      const unitPrice = Math.max(Number(item.price) || 0, 0);
      const unitDiscount = Math.min(
        Math.max(Number(item.discount) || 0, 0),
        unitPrice
      );

      return sum + unitDiscount * quantity;
    }, 0)
  );

  // Amount remaining after product discounts.
  const eligibleSubtotal = roundMoney(
    Math.max(subtotal - productDiscount, 0)
  );

  /*
   * RECALCULATE COUPON DISCOUNT
   *
   * Do not reuse order.couponDiscount here because it may
   * include the cancelled products' share of the coupon.
   *
   * This version assumes the coupon rate is 10%.
   */
  const couponRate = 0.10;

  const couponDiscount =
    items.length > 0
      ? roundMoney(eligibleSubtotal * couponRate)
      : 0;

  const shippingCharge =
    items.length > 0
      ? Math.max(Number(order.shippingCharge) || 0, 0)
      : 0;

  const tax =
    items.length > 0
      ? Math.max(Number(order.tax) || 0, 0)
      : 0;

  const totalAmount = roundMoney(
    Math.max(
      eligibleSubtotal - couponDiscount + shippingCharge + tax,
      0
    )
  );

  return new Promise((resolve, reject) => {
    const document = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    const chunks = [];

    document.on("data", (chunk) => {
      chunks.push(chunk);
    });

    document.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    document.on("error", reject);

    /*
     * INVOICE HEADER
     */

    document
      .fontSize(22)
      .font("Helvetica-Bold")
      .fillColor("#111111")
      .text("UrbanThread");

    document
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#555555")
      .text("Online Clothing Store")
      .text("Invoice");

    document.moveDown(1);

    /*
     * ORDER INFORMATION
     */

    document
      .fillColor("#111111")
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(`Order ID: ${order.orderId}`);

    document
      .fontSize(10)
      .font("Helvetica")
      .text(`Order Date: ${formatDateTime(order.createdAt)}`)
      .text(`Payment Method: ${order.paymentMethod}`)
      .text(`Payment Status: ${order.paymentStatus}`)
      .text(`Order Status: ${order.orderStatus}`);

    document.moveDown(1);

    /*
     * BILLING / SHIPPING ADDRESS
     */

    document
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Billing / Shipping Address");

    document
      .fontSize(10)
      .font("Helvetica")
      .text(order.shippingAddress?.fullName || "")
      .text(order.shippingAddress?.phone || "")
      .text(
        [
          order.shippingAddress?.houseName,
          order.shippingAddress?.street,
          order.shippingAddress?.city,
          order.shippingAddress?.state,
          order.shippingAddress?.pincode,
          order.shippingAddress?.country,
        ]
          .filter(Boolean)
          .join(", ")
      );

    document.moveDown(1);

    /*
     * ACTIVE ORDER ITEMS ONLY
     */

    document
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Ordered Items");

    document.moveDown(0.5);

    if (items.length === 0) {
      document
        .fontSize(10)
        .font("Helvetica")
        .text("No active products remain in this order.");
    } else {
      items.forEach((item, index) => {
        const quantity = Math.max(Number(item.quantity) || 0, 0);
        const unitPrice = Math.max(Number(item.price) || 0, 0);

        const unitDiscount = Math.min(
          Math.max(Number(item.discount) || 0, 0),
          unitPrice
        );

        const originalLineTotal = roundMoney(
          unitPrice * quantity
        );

        const productDiscountTotal = roundMoney(
          unitDiscount * quantity
        );

        const lineTotal = roundMoney(
          Math.max(originalLineTotal - productDiscountTotal, 0)
        );

        document
          .fontSize(10)
          .font("Helvetica-Bold")
          .text(
            `${index + 1}. ${item.productName || "Product"} | ` +
              `Size: ${item.size || "N/A"} | Qty: ${quantity}`
          );

        document
          .font("Helvetica")
          .text(`Unit Price: ${formatCurrency(unitPrice)}`)
          .text(
            `Line Subtotal: ${formatCurrency(originalLineTotal)}`
          );

        if (productDiscountTotal > 0) {
          document.text(
            `Product Discount: -${formatCurrency(productDiscountTotal)}`
          );
        }

        document.text(`Item Total: ${formatCurrency(lineTotal)}`);

        if (
          item.returnStatus &&
          item.returnStatus !== "Not Requested"
        ) {
          document.text(`Return Status: ${item.returnStatus}`);
        }

        document.moveDown(0.5);
      });
    }

    document.moveDown(0.5);

    /*
     * PRICE SUMMARY
     */

    document
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Price Summary");

    document
      .fontSize(10)
      .font("Helvetica")
      .text(`Subtotal: ${formatCurrency(subtotal)}`)
      .text(
        `Product Discount: -${formatCurrency(productDiscount)}`
      )
      .text(
        `Amount After Product Discount: ${formatCurrency(
          eligibleSubtotal
        )}`
      );

    if (couponDiscount > 0) {
      document.text(
        `Coupon${
          order.couponCode ? ` (${order.couponCode})` : ""
        }: -${formatCurrency(couponDiscount)}`
      );
    }

    document
      .text(
        `Shipping: ${
          shippingCharge === 0
            ? "Free"
            : formatCurrency(shippingCharge)
        }`
      )
      .text(`Tax: ${formatCurrency(tax)}`);

    document.moveDown(0.5);

    document
      .fontSize(13)
      .font("Helvetica-Bold")
      .text(`Total Amount: ${formatCurrency(totalAmount)}`);

    document.moveDown(2);

    document
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#666666")
      .text("Thank you for shopping with UrbanThread.", {
        align: "center",
      });

    document.end();
  });
};

/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

export {
  createOrder,
  getUserOrders,
  getUserOrderById,
  cancelUserOrder,
  cancelUserOrderItem,
  requestOrderItemReturn,
  generateOrderInvoicePdf,
};