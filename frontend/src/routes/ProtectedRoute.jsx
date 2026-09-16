import { useContext } from "react";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = () => {
  const {
    user,
    token,
    loading,
  } = useContext(AuthContext);

  const location = useLocation();

  // Wait until AuthContext finishes checking
  // the stored authentication token.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#181818]">
        <p className="text-sm text-neutral-400">
          Checking session...
        </p>
      </div>
    );
  }

  // If there is no valid token or user,
  // redirect to the public landing page.
  if (!token || !user) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  // User is authenticated.
  return <Outlet />;
};

export default ProtectedRoute;