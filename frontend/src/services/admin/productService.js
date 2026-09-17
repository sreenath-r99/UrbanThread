import axios from "axios";

const API_URL = "http://localhost:5000/api/admin/products";

const getAdminToken = () => {
  return localStorage.getItem("adminToken");
};

const getConfig = () => {
  const token = getAdminToken();

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getProducts = async (params = {}) => {
  const response = await axios.get(API_URL, {
    ...getConfig(),
    params,
  });

  return response.data;
};

export const getProductById = async (productId) => {
  const response = await axios.get(
    `${API_URL}/${productId}`,
    getConfig()
  );

  return response.data;
};

export const createProduct = async (productData) => {
  const response = await axios.post(
    API_URL,
    productData,
    getConfig()
  );

  return response.data;
};

export const updateProduct = async (
  productId,
  productData
) => {
  const response = await axios.put(
    `${API_URL}/${productId}`,
    productData,
    getConfig()
  );

  return response.data;
};

export const toggleProductStatus = async (productId) => {
  const response = await axios.patch(
    `${API_URL}/${productId}/toggle-status`,
    {},
    getConfig()
  );

  return response.data;
};

export const deleteProduct = async (productId) => {
  const response = await axios.delete(
    `${API_URL}/${productId}`,
    getConfig()
  );

  return response.data;
};