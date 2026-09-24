import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// ==========================
// GET CART
// ==========================

export const getCart = async (token) => {
  const response = await API.get("/cart", getAuthConfig(token));

  return response.data;
};

// ==========================
// ADD TO CART
// ==========================

export const addToCart = async (productId, size, quantity, token) => {
  const response = await API.post(
    "/cart/items",
    {
      productId,
      size,
      quantity,
    },
    getAuthConfig(token),
  );

  return response.data;
};

// ==========================
// UPDATE CART ITEM
// ==========================

export const updateCartItem = async (itemId, quantity, token) => {
  const response = await API.patch(
    `/cart/items/${itemId}`,
    {
      quantity,
    },
    getAuthConfig(token),
  );

  return response.data;
};

// ==========================
// REMOVE CART ITEM
// ==========================

export const removeFromCart = async (itemId, token) => {
  const response = await API.delete(
    `/cart/items/${itemId}`,
    getAuthConfig(token),
  );

  return response.data;
};

// ==========================
// CLEAR CART
// ==========================

export const clearCart = async (token) => {
  const response = await API.delete("/cart", getAuthConfig(token));

  return response.data;
};
