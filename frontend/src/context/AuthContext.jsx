import {
  createContext,
  useEffect,
  useState,
} from "react";

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
    let isMounted = true;

    const loadUser = async () => {
      // No token means there is no active session.
      if (!token) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }

        return;
      }

      try {
        const response = await getProfile(token);

        // Support both possible response structures:
        // { user: {...} }
        // or directly { ...user }
        const authenticatedUser =
          response?.user || response;

        if (isMounted) {
          setUser(authenticatedUser);
        }
      } catch (error) {
        console.error(
          "Failed to validate session:",
          error
        );

        // Remove invalid or expired session data.
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // =========================
  // NORMAL LOGIN
  // =========================

  const login = async (loginData) => {
    const response = await loginUser(loginData);

    if (!response?.token || !response?.user) {
      throw new Error(
        "Invalid login response from server"
      );
    }

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
    setLoading(false);

    return response;
  };

  // =========================
  // GOOGLE LOGIN
  // =========================

  const googleLogin = (authData) => {
    const {
      token: googleToken,
      user: googleUser,
    } = authData;

    if (!googleToken || !googleUser) {
      throw new Error(
        "Invalid Google authentication data"
      );
    }

    localStorage.setItem(
      "token",
      googleToken
    );

    localStorage.setItem(
      "user",
      JSON.stringify(googleUser)
    );

    setToken(googleToken);
    setUser(googleUser);
    setLoading(false);
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
    setLoading(false);
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