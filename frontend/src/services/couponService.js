import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

/*
|--------------------------------------------------------------------------
| ADMIN TOKEN
|--------------------------------------------------------------------------
*/

const getAdminToken = () => {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    throw new Error("Admin authentication required");
  }

  return token;
};

/*
|--------------------------------------------------------------------------
| ADMIN REQUEST CONFIG
|--------------------------------------------------------------------------
*/

const getAdminConfig = () => ({
  headers: {
    Authorization: `Bearer ${getAdminToken()}`,
  },
});

/*
|--------------------------------------------------------------------------
| GET COUPONS
|--------------------------------------------------------------------------
*/

export const getCoupons = async ({
  search = "",
  includeInactive = true,
} = {}) => {
  const response = await API.get("/coupons", {
    params: {
      search,
      includeInactive,
    },

    ...getAdminConfig(),
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET SINGLE COUPON
|--------------------------------------------------------------------------
*/

export const getCoupon = async (couponId) => {
  if (!couponId) {
    throw new Error("Coupon ID is required");
  }

  const response = await API.get(`/coupons/${couponId}`, getAdminConfig());

  return response.data;
};

/*
|--------------------------------------------------------------------------
| CREATE COUPON
|--------------------------------------------------------------------------
*/

export const createCoupon = async (payload) => {
  const response = await API.post("/coupons", payload, getAdminConfig());

  return response.data;
};

/*
|--------------------------------------------------------------------------
| UPDATE COUPON
|--------------------------------------------------------------------------
*/

export const updateCoupon = async (couponId, payload) => {
  if (!couponId) {
    throw new Error("Coupon ID is required");
  }

  const response = await API.patch(
    `/coupons/${couponId}`,
    payload,
    getAdminConfig(),
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| TOGGLE COUPON
|--------------------------------------------------------------------------
*/

export const toggleCouponStatus = async (couponId) => {
  if (!couponId) {
    throw new Error("Coupon ID is required");
  }

  const response = await API.patch(
    `/coupons/${couponId}/toggle`,
    {},
    getAdminConfig(),
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| DELETE COUPON
|--------------------------------------------------------------------------
*/

export const deleteCoupon = async (couponId) => {
  if (!couponId) {
    throw new Error("Coupon ID is required");
  }

  const response = await API.delete(`/coupons/${couponId}`, getAdminConfig());

  return response.data;
};

/*
|--------------------------------------------------------------------------
| VALIDATE COUPON - USER
|--------------------------------------------------------------------------
*/

export const validateCoupon = async (code, subtotal, token) => {
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await API.post(
    "/coupons/validate",
    {
      code,
      subtotal,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export default {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
  validateCoupon,
};
