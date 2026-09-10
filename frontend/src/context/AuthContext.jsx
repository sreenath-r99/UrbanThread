import { createContext, useEffect, useState } from "react";

import {
  getProfile,
  loginUser,
} from "../services/authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    localStorage.getItem("token") || null
  );

  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD LOGGED-IN USER
  // =========================

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getProfile(token);

        setUser(response.user);
      } catch (error) {
        console.error(
          "Failed to load user:",
          error
        );

        localStorage.removeItem("token");

        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // =========================
  // NORMAL LOGIN
  // =========================

  const login = async (loginData) => {
    const response = await loginUser(loginData);

    localStorage.setItem(
      "token",
      response.token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(response.user)
    );

    setToken(response.token);
    setUser(response.user);

    return response;
  };

  // =========================
  // GOOGLE LOGIN
  // =========================

  const googleLogin = (authData) => {
    const { token, user } = authData;

    if (!token || !user) {
      throw new Error(
        "Invalid Google authentication data"
      );
    }

    localStorage.setItem(
      "token",
      token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    setToken(token);
    setUser(user);
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,

        login,
        googleLogin,
        logout,

        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};