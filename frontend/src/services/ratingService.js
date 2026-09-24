import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

/*
|----------------------------------------------------------------------
| GET PRODUCT RATING
|----------------------------------------------------------------------
*/

export const getProductRating = async (productId, token = null) => {
  const config = {};

  /*
    |------------------------------------------------------------------
    | OPTIONAL AUTHORIZATION
    |------------------------------------------------------------------
    */

  if (token) {
    config.headers = {
      Authorization: `Bearer ${token}`,
    };
  }

  const response = await API.get(`/ratings/${productId}`, config);

  return response.data;
};

/*
|----------------------------------------------------------------------
| SUBMIT PRODUCT RATING
|----------------------------------------------------------------------
*/

export const submitProductRating = async (productId, rating, token) => {
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await API.post(
    `/ratings/${productId}`,
    {
      rating,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};
