import axios from "axios";

const API_URL = "http://localhost:5000/api/admin/subcategories";

const getAdminHeaders = () => {
  const token = localStorage.getItem("adminToken");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get all subcategories
export const getSubcategories = async (params = {}) => {
  const response = await axios.get(
    API_URL,
    {
      ...getAdminHeaders(),
      params,
    }
  );

  return response.data;
};

// Get single subcategory
export const getSubcategoryById = async (subcategoryId) => {
  const response = await axios.get(
    `${API_URL}/${subcategoryId}`,
    getAdminHeaders()
  );

  return response.data;
};

// Create subcategory
export const createSubcategory = async (subcategoryData) => {
  const response = await axios.post(
    API_URL,
    subcategoryData,
    getAdminHeaders()
  );

  return response.data;
};

// Update subcategory
export const updateSubcategory = async (
  subcategoryId,
  subcategoryData
) => {
  const response = await axios.put(
    `${API_URL}/${subcategoryId}`,
    subcategoryData,
    getAdminHeaders()
  );

  return response.data;
};

// Toggle subcategory status
export const toggleSubcategoryStatus = async (
  subcategoryId
) => {
  const response = await axios.patch(
    `${API_URL}/${subcategoryId}/toggle-status`,
    {},
    getAdminHeaders()
  );

  return response.data;
};

// Delete subcategory
export const deleteSubcategory = async (subcategoryId) => {
  const response = await axios.delete(
    `${API_URL}/${subcategoryId}`,
    getAdminHeaders()
  );

  return response.data;
};