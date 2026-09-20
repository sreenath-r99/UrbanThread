import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/admin",
});

/*
|--------------------------------------------------------------------------
| Admin Token
|--------------------------------------------------------------------------
*/

API.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/*
|--------------------------------------------------------------------------
| Get Categories
|--------------------------------------------------------------------------
|
| Supports:
|
| getCategories()
|
| getCategories("shirt")
|
| getCategories({
|   search: "shirt",
|   page: 1,
|   limit: 10,
|   sortBy: "createdAt",
|   sortOrder: "desc"
| })
|
|--------------------------------------------------------------------------
*/

const getCategories = async (
  options = ""
) => {
  let params = {
    search: "",
    includeInactive: true,
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  };

  /*
  |--------------------------------------------------------------------------
  | Backward compatibility
  |--------------------------------------------------------------------------
  */

  if (typeof options === "string") {
    params.search = options;
  } else if (
    typeof options === "object" &&
    options !== null
  ) {
    params = {
      ...params,
      ...options,
    };
  }

  const response = await API.get(
    "/categories",
    {
      params,
    }
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Get Single Category
|--------------------------------------------------------------------------
*/

const getCategory = async (
  categoryId
) => {
  const response = await API.get(
    `/categories/${categoryId}`
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Create Category
|--------------------------------------------------------------------------
*/

const createCategory = async (
  categoryData
) => {
  const response = await API.post(
    "/categories",
    categoryData
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Update Category
|--------------------------------------------------------------------------
*/

const updateCategory = async (
  categoryId,
  categoryData
) => {
  const response = await API.put(
    `/categories/${categoryId}`,
    categoryData
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Delete Category
|--------------------------------------------------------------------------
*/

const deleteCategory = async (
  categoryId
) => {
  const response = await API.delete(
    `/categories/${categoryId}`
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Toggle Category Status
|--------------------------------------------------------------------------
*/

const toggleCategoryStatus = async (
  categoryId
) => {
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