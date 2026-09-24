import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const shopApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

/*
|--------------------------------------------------------------------------
| GET PUBLIC PRODUCTS
|--------------------------------------------------------------------------
*/

export const getShopProducts = async ({
  search = "",
  categoryId = "",
  subcategoryId = "",
  minPrice = "",
  maxPrice = "",
  page = 1,
  limit = 12,
  sortBy = "createdAt",
  sortOrder = "desc",
} = {}) => {
  const response = await shopApi.get("/admin/products/store", {
    params: {
      search,
      categoryId,
      subcategoryId,
      minPrice,
      maxPrice,
      page,
      limit,
      sortBy,
      sortOrder,
    },
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET PUBLIC CATEGORIES
|--------------------------------------------------------------------------
*/

export const getShopCategories = async () => {
  const response = await shopApi.get("/admin/categories/store");

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET PUBLIC SUBCATEGORIES
|--------------------------------------------------------------------------
|
| Optional categoryId:
|
| No category:
| /admin/subcategories/store
|
| Selected category:
| /admin/subcategories/store?categoryId=...
|
|--------------------------------------------------------------------------
*/

export const getShopSubcategories = async ({ categoryId = "" } = {}) => {
  const response = await shopApi.get("/admin/subcategories/store", {
    params: {
      categoryId,
    },
  });

  return response.data;
};

export default shopApi;
