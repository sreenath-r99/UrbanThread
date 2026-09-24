import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/admin",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const getInventory = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
} = {}) => {
  const response = await API.get("/inventory", {
    params: {
      page,
      limit,
      search,
      status,
    },
  });

  return response.data;
};

const updateInventoryStock = async (productId, data) => {
  const response = await API.patch(`/inventory/${productId}/stock`, data);

  return response.data;
};

export { getInventory, updateInventoryStock };
