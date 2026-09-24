import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { AdminAuthContext } from "../context/AdminAuthContext";

const AdminProtectedRoute = () => {
  const { admin, adminToken, loading } = useContext(AdminAuthContext);

  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111111]">
        <p className="text-sm text-neutral-400">Checking admin session...</p>
      </div>
    );
  }

  if (!adminToken || !admin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
