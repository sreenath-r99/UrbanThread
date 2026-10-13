
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
| VALID RETURN STATUSES
|--------------------------------------------------------------------------
|
| "Not Requested" is the default state in the Order model.
| "Requested" is set when the customer submits a return.
| The remaining statuses are managed by the admin.
|
*/

const VALID_RETURN_STATUSES = [
  "Approved",
  "Rejected",
  "Pickup Scheduled",
  "Picked Up",
  "In Transit",
  "Received",
  "Inspected",
  "Refund Completed",
];

/*
|--------------------------------------------------------------------------
| ALLOWED ORDER STATUS TRANSITIONS
|--------------------------------------------------------------------------
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
| ALLOWED RETURN STATUS TRANSITIONS
|--------------------------------------------------------------------------
|
| Requested
|    ├── Approved
|    │      └── Pickup Scheduled
|    │              └── Picked Up
|    │                      └── In Transit
|    │                              └── Received
|    │                                      └── Inspected
|    │                                              └── Refund Completed
|    │
|    └── Rejected
|
| A return cannot skip a stage or move backwards.
|--------------------------------------------------------------------------
*/

const allowedReturnTransitions = {
  "Not Requested": ["Requested"],

  Requested: [
    "Approved",
    "Rejected",
  ],

  Approved: [
    "Pickup Scheduled",
  ],

  "Pickup Scheduled": [
    "Picked Up",
  ],

  "Picked Up": [
    "In Transit",
  ],

  "In Transit": [
    "Received",
  ],

  Received: [
    "Inspected",
  ],

  Inspected: [
    "Refund Completed",
  ],

  "Refund Completed": [],

  Rejected: [],
};

/*
|--------------------------------------------------------------------------
| BUILD SEARCH QUERY
|--------------------------------------------------------------------------
*/

const buildSearchQuery = (
  search = "",
  status = "",
) => {
  const query = {};

  const trimmedSearch = String(
    search || "",
  ).trim();

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

  if (status) {
    if (!VALID_STATUSES.includes(status)) {
      throw new Error(
        "Invalid order status filter",
      );
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
} = {}) => {
  const parsedPage = Math.max(
    Number(page) || 1,
    1,
  );

  const parsedLimit = Math.min(
    Math.max(Number(limit) || 10, 1),
    50,
  );

  const skip =
    (parsedPage - 1) * parsedLimit;

  const normalizedSortOrder =
    sortOrder === "asc" ? 1 : -1;

  const query = buildSearchQuery(
    search,
    status,
  );

  const [
    orders,
    totalOrders,
  ] = await Promise.all([
    Order.find(query)
      .populate(
        "user",
        "name email phone",
      )
      .sort({
        createdAt: normalizedSortOrder,
      })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),

    Order.countDocuments(query),
  ]);

  const totalPages = Math.ceil(
    totalOrders / parsedLimit,
  );

  return {
    orders,

    pagination: {
      currentPage: parsedPage,
      totalPages,
      totalOrders,
      limit: parsedLimit,
      hasNextPage:
        parsedPage < totalPages,
      hasPreviousPage:
        parsedPage > 1,
    },
  };
};

/*
|--------------------------------------------------------------------------
| GET SINGLE ADMIN ORDER
|--------------------------------------------------------------------------
*/

const getAdminOrderById = async (
  orderId,
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      orderId,
    )
  ) {
    throw new Error("Invalid order ID");
  }

  const order = await Order.findById(
    orderId,
  )
    .populate(
      "user",
      "name email phone",
    )
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
*/

const updateAdminOrderStatus = async (
  orderId,
  newStatus,
  reason = "",
) => {
  /*
   * VALIDATE ORDER ID
   */

  if (
    !mongoose.Types.ObjectId.isValid(
      orderId,
    )
  ) {
    throw new Error("Invalid order ID");
  }

  /*
   * VALIDATE NEW STATUS
   */

  if (
    !VALID_STATUSES.includes(newStatus)
  ) {
    throw new Error(
      "Invalid order status",
    );
  }

  /*
   * FIND ORDER
   */

  const order = await Order.findById(
    orderId,
  );

  if (!order) {
    throw new Error("Order not found");
  }

  /*
   * RETURN ORDER IF STATUS IS UNCHANGED
   */

  if (order.orderStatus === newStatus) {
    return Order.findById(order._id)
      .populate(
        "user",
        "name email phone",
      )
      .lean();
  }

  /*
   * HANDLE ORDER CANCELLATION
   *
   * Reuse the existing cancellation service
   * so stock restoration and cancellation
   * rules remain consistent.
   */

  if (newStatus === "Cancelled") {
    const cancelledOrder =
      await cancelUserOrder(
        order.user,
        order.orderId,
        reason,
      );

    return Order.findById(
      cancelledOrder._id,
    )
      .populate(
        "user",
        "name email phone",
      )
      .lean();
  }

  /*
   * VALIDATE ORDER STATUS TRANSITION
   */

  const allowedNextStatuses =
    allowedTransitions[
      order.orderStatus
    ] || [];

  if (
    !allowedNextStatuses.includes(
      newStatus,
    )
  ) {
    throw new Error(
      `Cannot change order status from "${order.orderStatus}" to "${newStatus}"`,
    );
  }

  /*
   * UPDATE ORDER STATUS
   */

  order.orderStatus = newStatus;

  /*
   * PAYMENT STATUS
   *
   * UrbanThread currently uses COD.
   * Mark payment as paid when delivery
   * is completed, as in the existing flow.
   */

  if (newStatus === "Delivered") {
    order.paymentStatus = "Paid";
  }

  /*
   * SAVE ORDER
   */

  await order.save();

  /*
   * RETURN UPDATED ORDER
   */

  return Order.findById(order._id)
    .populate(
      "user",
      "name email phone",
    )
    .lean();
};

/*
|--------------------------------------------------------------------------
| UPDATE ADMIN ORDER ITEM RETURN STATUS
|--------------------------------------------------------------------------
|
| Customer:
| Not Requested → Requested
|
| Admin:
| Requested → Approved / Rejected
| Approved → Pickup Scheduled
| Pickup Scheduled → Picked Up
| Picked Up → In Transit
| In Transit → Received
| Received → Inspected
| Inspected → Refund Completed
|
| This function updates the return status only.
| It does not issue a refund, restore stock,
| or schedule a physical pickup automatically.
|--------------------------------------------------------------------------
*/

const updateAdminOrderItemReturn = async (
  orderId,
  itemId,
  returnStatus,
) => {
  /*
   * VALIDATE ORDER ID
   */

  if (
    !mongoose.Types.ObjectId.isValid(
      orderId,
    )
  ) {
    throw new Error("Invalid order ID");
  }

  /*
   * VALIDATE ITEM ID
   */

  if (
    !mongoose.Types.ObjectId.isValid(
      itemId,
    )
  ) {
    throw new Error(
      "Invalid order item ID",
    );
  }

  /*
   * VALIDATE RETURN STATUS
   */

  if (
    !VALID_RETURN_STATUSES.includes(
      returnStatus,
    )
  ) {
    throw new Error(
      "Invalid return status",
    );
  }

  /*
   * FIND ORDER
   */

  const order = await Order.findById(
    orderId,
  );

  if (!order) {
    throw new Error("Order not found");
  }

  /*
   * FIND ORDER ITEM
   */

  const orderItem = order.items.find(
    (item) =>
      item._id.toString() === itemId,
  );

  if (!orderItem) {
    throw new Error(
      "Order item not found",
    );
  }

  /*
   * PREVENT RETURNING CANCELLED ITEMS
   */

  if (
    orderItem.itemStatus === "Cancelled"
  ) {
    throw new Error(
      "A cancelled product cannot be returned",
    );
  }

  /*
   * GET CURRENT RETURN STATUS
   *
   * Fallback supports older order items
   * that may not have a returnStatus value.
   */

  const currentReturnStatus =
    orderItem.returnStatus ||
    "Not Requested";

  /*
   * ENSURE A RETURN REQUEST EXISTS
   */

  if (
    currentReturnStatus ===
    "Not Requested"
  ) {
    throw new Error(
      "The customer has not requested a return for this item",
    );
  }

  /*
   * VALIDATE RETURN STATUS TRANSITION
   */

  const allowedNextStatuses =
    allowedReturnTransitions[
      currentReturnStatus
    ] || [];

  if (
    !allowedNextStatuses.includes(
      returnStatus,
    )
  ) {
    throw new Error(
      `Cannot change return status from "${currentReturnStatus}" to "${returnStatus}"`,
    );
  }

  /*
   * UPDATE RETURN STATUS
   */

  orderItem.returnStatus =
    returnStatus;

  /*
   * SAVE ORDER
   */

  await order.save();

  /*
   * RETURN UPDATED ORDER
   */

  return Order.findById(order._id)
    .populate(
      "user",
      "name email phone",
    )
    .lean();
};

/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

export {
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,
  updateAdminOrderItemReturn,
};