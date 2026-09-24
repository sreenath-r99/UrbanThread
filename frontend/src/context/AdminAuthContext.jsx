import { createContext, useEffect, useState } from "react";

import { loginAdmin } from "../services/adminService";

export const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);

  const [adminToken, setAdminToken] = useState(
    localStorage.getItem("adminToken") || null,
  );

  const [loading, setLoading] = useState(true);

  // ==========================
  // LOAD SAVED ADMIN SESSION
  // ==========================

  useEffect(() => {
    const loadSavedAdmin = () => {
      const savedAdmin = localStorage.getItem("admin");

      if (!adminToken) {
        setAdmin(null);
        setLoading(false);
        return;
      }

      if (!savedAdmin) {
        localStorage.removeItem("adminToken");
        setAdminToken(null);
        setAdmin(null);
        setLoading(false);
        return;
      }

      try {
        const parsedAdmin = JSON.parse(savedAdmin);
        setAdmin(parsedAdmin);
      } catch (error) {
        console.error("Failed to parse saved admin:", error);

        localStorage.removeItem("admin");
        localStorage.removeItem("adminToken");

        setAdminToken(null);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    loadSavedAdmin();
  }, [adminToken]);

  // ==========================
  // ADMIN LOGIN
  // ==========================

  const adminLogin = async (loginData) => {
    const response = await loginAdmin(loginData);

    if (!response?.token || !response?.admin) {
      throw new Error("Invalid admin login response from server");
    }

    localStorage.setItem("adminToken", response.token);

    localStorage.setItem("admin", JSON.stringify(response.admin));

    setAdminToken(response.token);
    setAdmin(response.admin);
    setLoading(false);

    return response;
  };

  // ==========================
  // ADMIN LOGOUT
  // ==========================

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");

    setAdminToken(null);
    setAdmin(null);
    setLoading(false);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        adminToken,
        loading,
        adminLogin,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthContext;
