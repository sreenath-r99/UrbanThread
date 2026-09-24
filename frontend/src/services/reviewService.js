import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

/*
|--------------------------------------------------------------------------
| GET PRODUCT REVIEWS
|--------------------------------------------------------------------------
|
| USER SIDE
|
|--------------------------------------------------------------------------
*/

export const getProductReviews = async (productId) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  const response = await API.get(`/reviews/${productId}`);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| CREATE PRODUCT REVIEW
|--------------------------------------------------------------------------
*/

export const createProductReview = async (productId, comment, token) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await API.post(
    `/reviews/${productId}`,
    {
      comment,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| UPDATE PRODUCT REVIEW
|--------------------------------------------------------------------------
*/

export const updateProductReview = async (reviewId, comment, token) => {
  if (!reviewId) {
    throw new Error("Review ID is required");
  }

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await API.patch(
    `/reviews/${reviewId}`,
    {
      comment,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| DELETE PRODUCT REVIEW
|--------------------------------------------------------------------------
*/

export const deleteProductReview = async (reviewId, token) => {
  if (!reviewId) {
    throw new Error("Review ID is required");
  }

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await API.delete(`/reviews/${reviewId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET ALL REVIEWS - ADMIN
|--------------------------------------------------------------------------
*/

export const getAdminReviews = async ({
  page = 1,
  limit = 10,
  search = "",
} = {}) => {
  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("Admin authentication required");
  }

  const response = await API.get("/admin/reviews", {
    params: {
      page,
      limit,
      search,
    },

    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| DELETE REVIEW - ADMIN
|--------------------------------------------------------------------------
*/

export const deleteAdminReview = async (reviewId) => {
  if (!reviewId) {
    throw new Error("Review ID is required");
  }

  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("Admin authentication required");
  }

  const response = await API.delete(`/admin/reviews/${reviewId}`, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  return response.data;
};

export default {
  getProductReviews,
  createProductReview,
  updateProductReview,
  deleteProductReview,
  getAdminReviews,
  deleteAdminReview,
};
