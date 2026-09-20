import api from "./api";

// ==========================
// ADMIN LOGIN
// ==========================

export const loginAdmin = async (
  loginData
) => {
  const response =
    await api.post(
      "/admin/login",
      loginData
    );

  return response.data;
};

// ==========================
// ADMIN FORGOT PASSWORD
// ==========================

export const forgotAdminPassword =
  async (email) => {
    const response =
      await api.post(
        "/admin/forgot-password",
        {
          email,
        }
      );

    return response.data;
  };

// ==========================
// VERIFY ADMIN RESET OTP
// ==========================

export const verifyAdminResetOtp =
  async (email, otp) => {
    const response =
      await api.post(
        "/admin/verify-reset-otp",
        {
          email,
          otp,
        }
      );

    return response.data;
  };

// ==========================
// RESET ADMIN PASSWORD
// ==========================

export const resetAdminPassword =
  async (
    resetToken,
    newPassword
  ) => {
    const response =
      await api.post(
        "/admin/reset-password",
        {
          resetToken,
          newPassword,
        }
      );

    return response.data;
  };