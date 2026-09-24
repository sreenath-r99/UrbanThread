import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

const userHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

const adminHeaders = (adminToken) => ({
  Authorization: `Bearer ${adminToken}`,
});

/*
|----------------------------------------------------------------------
| CREATE USER ORDER
|----------------------------------------------------------------------
|
| couponCode is optional. Only one coupon code can be sent for an
| order. The backend validates it again before creating the order.
|
|----------------------------------------------------------------------
*/

export const createOrder = async (addressId, token, couponCode = "") => {
  const response = await API.post(
    "/orders",

    {
      addressId,
      couponCode,
    },

    {
      headers: userHeaders(token),
    },
  );

  return response.data;
};

/*
|----------------------------------------------------------------------
| GET USER ORDERS
|----------------------------------------------------------------------
*/

export const getOrders = async (token, search = "") => {
  const response = await API.get(
    "/orders",

    {
      params: {
        search,
      },

      headers: userHeaders(token),
    },
  );

  return response.data;
};

/*
|----------------------------------------------------------------------
| GET USER ORDER
|----------------------------------------------------------------------
*/

export const getOrder = async (orderId, token) => {
  const response = await API.get(
    `/orders/${orderId}`,

    {
      headers: userHeaders(token),
    },
  );

  return response.data;
};

/*
|----------------------------------------------------------------------
| CANCEL WHOLE USER ORDER
|----------------------------------------------------------------------
*/

export const cancelOrder = async (orderId, reason = "", token) => {
  const response = await API.patch(
    `/orders/${orderId}/cancel`,

    {
      reason,
    },

    {
      headers: userHeaders(token),
    },
  );

  return response.data;
};

/*
|----------------------------------------------------------------------
| CANCEL USER ORDER ITEM
|----------------------------------------------------------------------
*/

export const cancelOrderItem = async (orderId, itemId, reason = "", token) => {
  const response = await API.patch(
    `/orders/${orderId}/items/${itemId}/cancel`,

    {
      reason,
    },

    {
      headers: userHeaders(token),
    },
  );

  return response.data;
};

/*
|----------------------------------------------------------------------
| ADMIN ORDERS
|----------------------------------------------------------------------
*/

export const getAdminOrders = async (adminToken, filters = {}) => {
  const response = await API.get(
    "/admin/orders",

    {
      params: {
        page: filters.page || 1,

        limit: filters.limit || 10,

        search: filters.search || "",

        status: filters.status || "",

        sortOrder: filters.sortOrder || "desc",
      },

      headers: adminHeaders(adminToken),
    },
  );

  return response.data;
};

/*
|----------------------------------------------------------------------
| ADMIN SINGLE ORDER
|----------------------------------------------------------------------
*/

export const getAdminOrder = async (orderId, adminToken) => {
  const response = await API.get(
    `/admin/orders/${orderId}`,

    {
      headers: adminHeaders(adminToken),
    },
  );

  return response.data;
};

/*
|----------------------------------------------------------------------
| ADMIN UPDATE ORDER STATUS
|----------------------------------------------------------------------
*/

export const updateAdminOrderStatus = async (
  orderId,
  status,
  adminToken,
  cancellationReason = "",
) => {
  const response = await API.patch(
    `/admin/orders/${orderId}/status`,

    {
      status,
      cancellationReason,
    },

    {
      headers: adminHeaders(adminToken),
    },
  );

  return response.data;
};

export default {
  createOrder,
  getOrders,
  getOrder,
  cancelOrder,
  cancelOrderItem,
  getAdminOrders,
  getAdminOrder,
  updateAdminOrderStatus,
};
