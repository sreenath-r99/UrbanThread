import axios from "axios";

const API = axios.create({
  baseURL:
    "http://localhost:5000/api/admin",
});

/*
|--------------------------------------------------------------------------
| ADMIN TOKEN
|--------------------------------------------------------------------------
*/

API.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "adminToken"
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) =>
    Promise.reject(error)
);

/*
|--------------------------------------------------------------------------
| GET PRODUCTS
|--------------------------------------------------------------------------
*/

export const getProducts =
  async (options = {}) => {
    const response =
      await API.get("/products", {
        params: {
          search:
            options.search || "",
          categoryId:
            options.categoryId || "",
          subcategoryId:
            options.subcategoryId || "",
          includeInactive:
            options.includeInactive ??
            true,
          page:
            options.page || 1,
          limit:
            options.limit || 10,
          sortBy:
            options.sortBy ||
            "createdAt",
          sortOrder:
            options.sortOrder ||
            "desc",
        },
      });

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| GET SINGLE PRODUCT
|--------------------------------------------------------------------------
*/

export const getProduct =
  async (productId) => {
    const response =
      await API.get(
        `/products/${productId}`
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| CREATE PRODUCT
|--------------------------------------------------------------------------
*/

export const createProduct =
  async (productData) => {
    const response =
      await API.post(
        "/products",
        productData
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| UPDATE PRODUCT
|--------------------------------------------------------------------------
*/

export const updateProduct =
  async (
    productId,
    productData
  ) => {
    const response =
      await API.put(
        `/products/${productId}`,
        productData
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| TOGGLE PRODUCT STATUS
|--------------------------------------------------------------------------
*/

export const toggleProductStatus =
  async (productId) => {
    const response =
      await API.patch(
        `/products/${productId}/toggle-status`
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| DELETE PRODUCT
|--------------------------------------------------------------------------
*/

export const deleteProduct =
  async (productId) => {
    const response =
      await API.delete(
        `/products/${productId}`
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| UPLOAD PRODUCT IMAGES
|--------------------------------------------------------------------------
*/

export const uploadProductImages =
  async (files) => {
    const formData =
      new FormData();

    files.forEach((file) => {
      formData.append(
        "images",
        file
      );
    });

    const response =
      await API.post(
        "/product-images/upload",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| DELETE CLOUDINARY PRODUCT IMAGE
|--------------------------------------------------------------------------
*/

export const deleteProductImage =
  async (publicId) => {
    const response =
      await API.delete(
        "/product-images/delete",
        {
          data: {
            publicId,
          },
        }
      );

    return response.data;
  };