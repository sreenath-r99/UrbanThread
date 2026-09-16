import api from "./api";

// ==========================
// ADMIN LOGIN
// ==========================

export const loginAdmin = async (loginData) => {
  const response = await api.post(
    "/admin/login",
    loginData
  );

  return response.data;
};