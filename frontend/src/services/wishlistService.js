// frontend/src/services/wishlistService.js

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getWishlist = async (token) => {
  const response = await API.get(
    "/wishlist",
    getAuthConfig(token)
  );

  return response.data;
};

export const checkWishlist = async (
  productId,
  token
) => {
  const response = await API.get(
    `/wishlist/check/${productId}`,
    getAuthConfig(token)
  );

  return response.data;
};

export const addToWishlist = async (
  productId,
  token
) => {
  const response = await API.post(
    `/wishlist/${productId}`,
    {},
    getAuthConfig(token)
  );

  return response.data;
};

export const removeFromWishlist =
  async (productId, token) => {
    const response = await API.delete(
      `/wishlist/${productId}`,
      getAuthConfig(token)
    );

    return response.data;
  };

export const clearWishlist = async (
  token
) => {
  const response = await API.delete(
    "/wishlist",
    getAuthConfig(token)
  );

  return response.data;
};