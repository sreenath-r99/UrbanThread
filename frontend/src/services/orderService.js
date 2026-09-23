// frontend/src/services/orderService.js

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

/*
|--------------------------------------------------------------------------
| AUTH CONFIG
|--------------------------------------------------------------------------
*/

const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

/*
|--------------------------------------------------------------------------
| USER — CREATE ORDER
|--------------------------------------------------------------------------
*/

export const createOrder = async (
  addressId,
  token
) => {
  const response = await API.post(
    "/orders",
    {
      addressId,
    },
    getAuthConfig(token)
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| USER — GET ORDERS
|--------------------------------------------------------------------------
*/

export const getOrders = async (
  token,
  search = ""
) => {
  const response = await API.get(
    "/orders",
    {
      ...getAuthConfig(token),

      params: {
        search,
      },
    }
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| USER — GET SINGLE ORDER
|--------------------------------------------------------------------------
*/

export const getOrder = async (
  orderId,
  token
) => {
  const response = await API.get(
    `/orders/${orderId}`,
    getAuthConfig(token)
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| USER — CANCEL ORDER
|--------------------------------------------------------------------------
*/

export const cancelOrder = async (
  orderId,
  reason,
  token
) => {
  const response = await API.patch(
    `/orders/${orderId}/cancel`,
    {
      reason,
    },
    getAuthConfig(token)
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| USER — CANCEL INDIVIDUAL ORDER ITEM
|--------------------------------------------------------------------------
*/

export const cancelOrderItem = async (
  orderId,
  itemId,
  reason,
  token
) => {
  const response = await API.patch(
    `/orders/${orderId}/items/${itemId}/cancel`,
    {
      reason,
    },
    getAuthConfig(token)
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| ADMIN — GET ORDERS
|--------------------------------------------------------------------------
*/

export const getAdminOrders = async (
  token,
  {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    sortOrder = "desc",
  } = {}
) => {
  const response = await API.get(
    "/admin/orders",
    {
      ...getAuthConfig(token),

      params: {
        page,
        limit,
        search,
        status,
        sortOrder,
      },
    }
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| ADMIN — GET SINGLE ORDER
|--------------------------------------------------------------------------
*/

export const getAdminOrder = async (
  orderId,
  token
) => {
  const response = await API.get(
    `/admin/orders/${orderId}`,
    getAuthConfig(token)
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| ADMIN — UPDATE ORDER STATUS
|--------------------------------------------------------------------------
*/

export const updateAdminOrderStatus =
  async (
    orderId,
    status,
    token,
    reason = ""
  ) => {
    const response =
      await API.patch(
        `/admin/orders/${orderId}/status`,
        {
          status,
          reason,
        },
        getAuthConfig(token)
      );

    return response.data;
  };