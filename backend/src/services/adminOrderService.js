import mongoose from "mongoose";

import Order from "../models/Order.js";

import { cancelUserOrder } from "./orderService.js";

/*
|--------------------------------------------------------------------------
| VALID ORDER STATUSES
|--------------------------------------------------------------------------
*/

const VALID_STATUSES = [
  "Pending",
  "Partially Cancelled",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

/*
|--------------------------------------------------------------------------
| ALLOWED STATUS TRANSITIONS
|--------------------------------------------------------------------------
|
| Pending
|    ↓
| Shipped
|    ↓
| Out for Delivery
|    ↓
| Delivered
|
| Pending
|    ↓
| Cancelled
|
| Partially Cancelled
|    ↓
| Shipped
|
*/

const allowedTransitions = {
  Pending: ["Shipped", "Cancelled"],

  "Partially Cancelled": ["Shipped", "Cancelled"],

  Shipped: ["Out for Delivery"],

  "Out for Delivery": ["Delivered"],

  Delivered: [],

  Cancelled: [],
};

/*
|--------------------------------------------------------------------------
| BUILD SEARCH QUERY
|--------------------------------------------------------------------------
*/

const buildSearchQuery = (search = "", status = "") => {
  const query = {};

  const trimmedSearch = search.trim();

  /*
   * SEARCH
   *
   * Search by:
   * - Order ID
   * - Customer name
   * - Customer phone
   */

  if (trimmedSearch) {
    query.$or = [
      {
        orderId: {
          $regex: trimmedSearch,
          $options: "i",
        },
      },

      {
        "shippingAddress.fullName": {
          $regex: trimmedSearch,
          $options: "i",
        },
      },

      {
        "shippingAddress.phone": {
          $regex: trimmedSearch,
          $options: "i",
        },
      },
    ];
  }

  /*
   * STATUS FILTER
   */

  if (status) {
    if (!VALID_STATUSES.includes(status)) {
      throw new Error("Invalid order status filter");
    }

    query.orderStatus = status;
  }

  return query;
};

/*
|--------------------------------------------------------------------------
| GET ADMIN ORDERS
|--------------------------------------------------------------------------
*/

const getAdminOrders = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
  sortOrder = "desc",
}) => {
  /*
   * Make sure page is at least 1.
   */

  const parsedPage = Math.max(Number(page) || 1, 1);

  /*
   * Limit between 1 and 50.
   */

  const parsedLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

  /*
   * Calculate MongoDB skip.
   */

  const skip = (parsedPage - 1) * parsedLimit;

  /*
   * Descending = newest first.
   * Ascending = oldest first.
   */

  const normalizedSortOrder = sortOrder === "asc" ? 1 : -1;

  /*
   * Build search/filter query.
   */

  const query = buildSearchQuery(search, status);

  /*
   * Fetch orders and total count
   * at the same time.
   */

  const [orders, totalOrders] = await Promise.all([
    Order.find(query)
      .populate("user", "name email phone")
      .sort({
        createdAt: normalizedSortOrder,
      })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),

    Order.countDocuments(query),
  ]);

  /*
   * Calculate total pages.
   */

  const totalPages = Math.ceil(totalOrders / parsedLimit);

  return {
    orders,

    pagination: {
      currentPage: parsedPage,

      totalPages,

      totalOrders,

      limit: parsedLimit,

      hasNextPage: parsedPage < totalPages,

      hasPreviousPage: parsedPage > 1,
    },
  };
};

/*
|--------------------------------------------------------------------------
| GET SINGLE ADMIN ORDER
|--------------------------------------------------------------------------
*/

const getAdminOrderById = async (orderId) => {
  /*
   * Validate MongoDB ObjectId.
   */

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error("Invalid order ID");
  }

  /*
   * Fetch order and populate
   * user information.
   */

  const order = await Order.findById(orderId)
    .populate("user", "name email phone")
    .lean();

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
};

/*
|--------------------------------------------------------------------------
| UPDATE ADMIN ORDER STATUS
|--------------------------------------------------------------------------
|
| This is the function that handles:
|
| Pending
|    ↓
| Shipped
|
| Shipped
|    ↓
| Out for Delivery
|
| Out for Delivery
|    ↓
| Delivered
|
| And cancellation.
|--------------------------------------------------------------------------
*/

const updateAdminOrderStatus = async (orderId, newStatus, reason = "") => {
  /*
   * ---------------------------------------------------------------
   * VALIDATE ORDER ID
   * ---------------------------------------------------------------
   */

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error("Invalid order ID");
  }

  /*
   * ---------------------------------------------------------------
   * VALIDATE STATUS
   * ---------------------------------------------------------------
   */

  if (!VALID_STATUSES.includes(newStatus)) {
    throw new Error("Invalid order status");
  }

  /*
   * ---------------------------------------------------------------
   * FIND ORDER
   * ---------------------------------------------------------------
   */

  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  /*
   * ---------------------------------------------------------------
   * SAME STATUS
   * ---------------------------------------------------------------
   *
   * If the order already has this status,
   * don't perform another update.
   */

  if (order.orderStatus === newStatus) {
    return Order.findById(order._id)
      .populate("user", "name email phone")
      .lean();
  }

  /*
   * ---------------------------------------------------------------
   * CANCEL ORDER
   * ---------------------------------------------------------------
   *
   * IMPORTANT:
   *
   * We reuse the existing user cancellation
   * service instead of duplicating cancellation
   * and stock-restoration logic.
   *
   * order.user is already the User ObjectId.
   */

  if (newStatus === "Cancelled") {
    const cancelledOrder = await cancelUserOrder(
      order.user,
      order.orderId,
      reason,
    );

    return Order.findById(cancelledOrder._id)
      .populate("user", "name email phone")
      .lean();
  }

  /*
   * ---------------------------------------------------------------
   * VALIDATE STATUS TRANSITION
   * ---------------------------------------------------------------
   */

  const allowedNextStatuses = allowedTransitions[order.orderStatus] || [];

  if (!allowedNextStatuses.includes(newStatus)) {
    throw new Error(
      `Cannot change order status from "${order.orderStatus}" to "${newStatus}"`,
    );
  }

  /*
   * ---------------------------------------------------------------
   * UPDATE ORDER STATUS
   * ---------------------------------------------------------------
   */

  order.orderStatus = newStatus;

  /*
   * ---------------------------------------------------------------
   * PAYMENT STATUS
   * ---------------------------------------------------------------
   *
   * UrbanThread currently uses COD.
   *
   * Therefore payment is considered
   * successfully collected when the order
   * reaches Delivered.
   */

  if (newStatus === "Delivered") {
    order.paymentStatus = "Paid";
  }

  /*
   * ---------------------------------------------------------------
   * SAVE ORDER
   * ---------------------------------------------------------------
   */

  await order.save();

  /*
   * ---------------------------------------------------------------
   * RETURN UPDATED ORDER
   * ---------------------------------------------------------------
   */

  return Order.findById(order._id).populate("user", "name email phone").lean();
};

export { getAdminOrders, getAdminOrderById, updateAdminOrderStatus };
