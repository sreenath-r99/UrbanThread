import {
  Navigate,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";

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

import Shop from "../pages/user/Shop";
import ProductDetails from "../pages/user/ProductDetails";
import Cart from "../pages/user/Cart";
import Wishlist from "../pages/user/Wishlist";

import Checkout from "../pages/user/Checkout";
import OrderSuccess from "../pages/user/OrderSuccess";
import Orders from "../pages/user/Orders";
import OrderDetails from "../pages/user/OrderDetails";

// ==========================
// ADMIN PAGES
// ==========================

import AdminLogin from "../pages/admin/AdminLogin";
import AdminForgotPassword from "../pages/admin/AdminForgotPassword";
import AdminVerifyResetOtp from "../pages/admin/AdminVerifyResetOtp";
import AdminResetPassword from "../pages/admin/AdminResetPassword";
import AdminDashboard from "../pages/admin/AdminDashboard";

import Categories from "../pages/admin/Categories";
import AddCategory from "../pages/admin/AddCategory";
import EditCategory from "../pages/admin/EditCategory";

import Subcategories from "../pages/admin/Subcategories";
import AddSubcategory from "../pages/admin/AddSubcategory";
import EditSubcategory from "../pages/admin/EditSubcategory";

import Products from "../pages/admin/Products";
import Inventory from "../pages/admin/Inventory";
import Users from "../pages/admin/Users";
import AdminOrders from "../pages/admin/Orders";

// ==========================
// ADMIN COMPONENTS
// ==========================

import AdminLayout from "../components/admin/AdminLayout";

// ==========================
// ROUTE PROTECTION
// ==========================

import ProtectedRoute from "./ProtectedRoute";
import AdminProtectedRoute from "./AdminProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ============================================================ */}
      {/* PUBLIC USER AUTH ROUTES */}
      {/* ============================================================ */}

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

      <Route
        path="/"
        element={<Landing />}
      />

      {/* ============================================================ */}
      {/* PROTECTED USER ROUTES */}
      {/* ============================================================ */}

      <Route
        element={<ProtectedRoute />}
      >
        {/* HOME */}

        <Route
          path="/home"
          element={<Home />}
        />

        {/* SHOP */}

        <Route
          path="/shop"
          element={<Shop />}
        />

        {/* PRODUCT DETAILS */}

        <Route
          path="/products/:productId"
          element={<ProductDetails />}
        />

        {/* CART */}

        <Route
          path="/cart"
          element={<Cart />}
        />

        {/* CHECKOUT */}

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        {/* WISHLIST */}

        <Route
          path="/wishlist"
          element={<Wishlist />}
        />

        {/* ORDERS */}

        <Route
          path="/orders"
          element={<Orders />}
        />

        {/* ORDER DETAILS */}

        <Route
          path="/orders/:orderId"
          element={<OrderDetails />}
        />

        {/* ORDER SUCCESS */}

        <Route
          path="/order-success/:orderId"
          element={<OrderSuccess />}
        />

        {/* PROFILE */}

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

        {/* ADDRESSES */}

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

      {/* ============================================================ */}
      {/* ADMIN AUTH ROUTES */}
      {/* ============================================================ */}

      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />

      <Route
        path="/admin/forgot-password"
        element={<AdminForgotPassword />}
      />

      <Route
        path="/admin/verify-reset-otp"
        element={<AdminVerifyResetOtp />}
      />

      <Route
        path="/admin/reset-password"
        element={<AdminResetPassword />}
      />

      {/* ============================================================ */}
      {/* PROTECTED ADMIN ROUTES */}
      {/* ============================================================ */}

      <Route
        element={<AdminProtectedRoute />}
      >
        {/* ========================================================== */}
        {/* ADMIN LAYOUT */}
        {/* ========================================================== */}

        <Route
          element={
            <AdminLayout>
              <Outlet />
            </AdminLayout>
          }
        >
          {/* ======================================================== */}
          {/* DASHBOARD */}
          {/* ======================================================== */}

          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          {/* ======================================================== */}
          {/* PRODUCTS */}
          {/* ======================================================== */}

          <Route
            path="/admin/products"
            element={<Products />}
          />

          {/* ======================================================== */}
          {/* INVENTORY */}
          {/* ======================================================== */}

          <Route
            path="/admin/inventory"
            element={<Inventory />}
          />

          {/* ======================================================== */}
          {/* CATEGORIES */}
          {/* ======================================================== */}

          <Route
            path="/admin/categories"
            element={<Categories />}
          />

          <Route
            path="/admin/categories/add"
            element={<AddCategory />}
          />

          <Route
            path="/admin/categories/edit/:categoryId"
            element={<EditCategory />}
          />

          {/* ======================================================== */}
          {/* SUBCATEGORIES */}
          {/* ======================================================== */}

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

          {/* ======================================================== */}
          {/* ORDERS */}
          {/* ======================================================== */}

          <Route
            path="/admin/orders"
            element={<AdminOrders />}
          />

          {/* ======================================================== */}
          {/* USERS */}
          {/* ======================================================== */}

          <Route
            path="/admin/users"
            element={<Users />}
          />
        </Route>
      </Route>

      {/* ============================================================ */}
      {/* FALLBACK */}
      {/* ============================================================ */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
};

export default AppRoutes;