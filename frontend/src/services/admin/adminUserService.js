import axios from "axios";

/*
|--------------------------------------------------------------------------
| ADMIN API
|--------------------------------------------------------------------------
*/

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
| GET USERS
|--------------------------------------------------------------------------
*/

export const getUsers =
  async ({
    search = "",
    page = 1,
    limit = 10,
  } = {}) => {
    const response =
      await API.get(
        "/users",
        {
          params: {
            search,
            page,
            limit,
          },
        }
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| GET SINGLE USER
|--------------------------------------------------------------------------
*/

export const getUser =
  async (userId) => {
    const response =
      await API.get(
        `/users/${userId}`
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| BLOCK USER
|--------------------------------------------------------------------------
*/

export const blockUser =
  async (userId) => {
    const response =
      await API.patch(
        `/users/${userId}/block`
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| UNBLOCK USER
|--------------------------------------------------------------------------
*/

export const unblockUser =
  async (userId) => {
    const response =
      await API.patch(
        `/users/${userId}/unblock`
      );

    return response.data;
  };