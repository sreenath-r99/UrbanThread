import { Navigate, Routes, Route } from "react-router-dom";

// ==========================
// USER PAGES
// ==========================

import Register from "../pages/user/Register";
import VerifyOtp from "../pages/user/VerifyOtp";
import Login from "../pages/user/Login";

import Landing from "../pages/user/Landing";
import Home from "../pages/user/Home";

import ForgotPassword from "../pages/user/ForgotPassword";
import VerifyResetOtp from "../pages/user/VerifyResetOtp";
import CreateNewPassword from "../pages/user/CreateNewPassword";

import Profile from "../pages/user/Profile";
import EditProfile from "../pages/user/EditProfile";
import ChangePassword from "../pages/user/ChangePassword";
import ChangeEmail from "../pages/user/ChangeEmail";

import Addresses from "../pages/user/Addresses";
import AddAddress from "../pages/user/AddAddress";
import EditAddress from "../pages/user/EditAddress";

import Categories from "../pages/admin/Categories";
import AddCategory from "../pages/admin/AddCategory";
import EditCategory from "../pages/admin/EditCategory";

import Subcategories from "../pages/admin/Subcategories";
import AddSubcategory from "../pages/admin/AddSubcategory";
import EditSubcategory from "../pages/admin/EditSubcategory";

import Products from "../pages/admin/Products.jsx";
import AdminLayout from "../components/admin/AdminLayout.jsx";

// ==========================
// USER ROUTE PROTECTION
// ==========================

import ProtectedRoute from "./ProtectedRoute";

// ==========================
// ADMIN PAGES
// ==========================

import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";

// ==========================
// ADMIN ROUTE PROTECTION
// ==========================

import AdminProtectedRoute from "./AdminProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ==========================
          USER PUBLIC AUTH ROUTES
      ========================== */}

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/verify-otp"
        element={<VerifyOtp />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      {/* ==========================
          USER PASSWORD RESET ROUTES
      ========================== */}

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/verify-reset-otp"
        element={<VerifyResetOtp />}
      />

      <Route
        path="/create-new-password"
        element={<CreateNewPassword />}
      />

      {/* ==========================
          USER LANDING PAGE
      ========================== */}

      <Route
        path="/"
        element={<Landing />}
      />

      {/* ==========================
          USER PROTECTED ROUTES
      ========================== */}

      <Route element={<ProtectedRoute />}>
        <Route
          path="/home"
          element={<Home />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/profile/edit"
          element={<EditProfile />}
        />

        <Route
          path="/profile/change-password"
          element={<ChangePassword />}
        />

        <Route
          path="/profile/change-email"
          element={<ChangeEmail />}
        />

        <Route
          path="/addresses"
          element={<Addresses />}
        />

        <Route
          path="/addresses/add"
          element={<AddAddress />}
        />

        <Route
          path="/addresses/edit/:addressId"
          element={<EditAddress />}
        />
      </Route>

      {/* ==========================
          ADMIN PUBLIC ROUTES
      ========================== */}

      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />

      {/* ==========================
          ADMIN PROTECTED ROUTES
      ========================== */}

      <Route element={<AdminProtectedRoute />}>
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />
      </Route>

      <Route path="/admin/categories" element={<Categories />} />
<Route path="/admin/categories/add" element={<AddCategory />} />
<Route
  path="/admin/categories/edit/:categoryId"
  element={<EditCategory />}
/>

<Route
  path="/admin/subcategories"
  element={<Subcategories />}
/>

<Route
  path="/admin/subcategories/add"
  element={<AddSubcategory />}
/>

<Route
  path="/admin/subcategories/edit/:subcategoryId"
  element={<EditSubcategory />}
/>

<Route
  path="/admin/products"
  element={
    <AdminProtectedRoute>
      <AdminLayout>
        <Products />
      </AdminLayout>
    </AdminProtectedRoute>
  }
/>

      {/* ==========================
          FALLBACK ROUTE
      ========================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
};

export default AppRoutes;