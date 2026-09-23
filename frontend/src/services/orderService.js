// frontend/src/services/orderService.js

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

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

export const getOrders = async (token) => {
  const response = await API.get(
    "/orders",
    getAuthConfig(token)
  );

  return response.data;
};

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
| Cancel Individual Order Item
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