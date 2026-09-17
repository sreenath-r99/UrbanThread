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

const getCategories = async (search = "") => {
  const response = await API.get("/categories", {
    params: {
      search,
      includeInactive: true,
    },
  });

  return response.data;
};

const getCategory = async (categoryId) => {
  const response = await API.get(`/categories/${categoryId}`);

  return response.data;
};

const createCategory = async (categoryData) => {
  const response = await API.post("/categories", categoryData);

  return response.data;
};

const updateCategory = async (categoryId, categoryData) => {
  const response = await API.put(
    `/categories/${categoryId}`,
    categoryData
  );

  return response.data;
};

const deleteCategory = async (categoryId) => {
  const response = await API.delete(`/categories/${categoryId}`);

  return response.data;
};

const toggleCategoryStatus = async (categoryId) => {
  const response = await API.patch(
    `/categories/${categoryId}/toggle-status`
  );

  return response.data;
};

export {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
};