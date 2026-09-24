import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

/*
|--------------------------------------------------------------------------
| GET SINGLE PRODUCT
|--------------------------------------------------------------------------
*/

const getProductDetails = async (productId) => {
  const response = await API.get(`/admin/products/store/${productId}`);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET RELATED PRODUCTS
|--------------------------------------------------------------------------
*/

const getRelatedProducts = async (productId) => {
  const response = await API.get(`/admin/products/store/${productId}/related`, {
    params: {
      limit: 4,
    },
  });

  return response.data;
};

export { getProductDetails, getRelatedProducts };
