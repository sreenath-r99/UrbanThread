import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

/*
|----------------------------------------------------------------------
| GET ONLY APPLICABLE COUPONS
|----------------------------------------------------------------------
*/

export const getAvailableCoupons = async (token, subtotal) => {
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await API.get("/coupons/available", {
    params: {
      subtotal,
    },

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

/*
|----------------------------------------------------------------------
| APPLY COUPON
|----------------------------------------------------------------------
*/

export const applyCoupon = async (code, subtotal, token) => {
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await API.post(
    "/coupons/available/apply",

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
  getAvailableCoupons,
  applyCoupon,
};
