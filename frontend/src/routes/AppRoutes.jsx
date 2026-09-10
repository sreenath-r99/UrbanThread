import {
  Routes,
  Route,
} from "react-router-dom";

import Register from "../pages/user/Register";
import VerifyOtp from "../pages/user/VerifyOtp";
import Login from "../pages/user/Login";
import Home from "../pages/user/Home";

import ForgotPassword from "../pages/user/ForgotPassword";
import VerifyResetOtp from "../pages/user/VerifyResetOtp";
import CreateNewPassword from "../pages/user/CreateNewPassword";


const AppRoutes = () => {
  return (
    <Routes>

      {/* ======================
          USER AUTH
      ====================== */}

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


      {/* ======================
          FORGOT PASSWORD
      ====================== */}

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


      {/* ======================
          HOME
      ====================== */}

      <Route
        path="/"
        element={<Home />}
      />

    </Routes>
  );
};


export default AppRoutes;