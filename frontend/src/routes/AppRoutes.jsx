import { Routes, Route } from "react-router-dom";

import Register from "../pages/user/Register";
import VerifyOtp from "../pages/user/VerifyOtp";

const AppRoutes = () => {
  return (
    <Routes>

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/verify-otp"
        element={<VerifyOtp />}
      />

    </Routes>
  );
};

export default AppRoutes;