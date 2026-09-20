import {
  loginAdmin,
  forgotAdminPassword,
  verifyAdminResetOtp,
  resetAdminPassword,
} from "../services/adminService.js";

// ==========================
// ADMIN LOGIN
// ==========================

export const adminLogin = async (
  req,
  res
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const result =
      await loginAdmin(
        email,
        password
      );

    return res.status(200).json({
      success: true,
      message:
        "Admin login successful",
      token: result.token,
      admin: result.admin,
    });
  } catch (error) {
    console.error(
      "Admin login error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message:
        error.message ||
        "Admin login failed",
    });
  }
};

// ==========================
// FORGOT ADMIN PASSWORD
// ==========================

export const adminForgotPassword =
  async (req, res) => {
    try {
      const { email } =
        req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message:
            "Admin email is required",
        });
      }

      const result =
        await forgotAdminPassword(
          email
        );

      return res.status(200).json({
        success: true,
        message:
          result.message,
      });
    } catch (error) {
      console.error(
        "Admin forgot password error:",
        error.message
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Unable to process password reset request",
      });
    }
  };

// ==========================
// VERIFY ADMIN RESET OTP
// ==========================

export const adminVerifyResetOtp =
  async (req, res) => {
    try {
      const {
        email,
        otp,
      } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message:
            "Email and OTP are required",
        });
      }

      const result =
        await verifyAdminResetOtp(
          email,
          otp
        );

      return res.status(200).json({
        success: true,
        message:
          "OTP verified successfully",
        resetToken:
          result.resetToken,
      });
    } catch (error) {
      console.error(
        "Admin OTP verification error:",
        error.message
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "OTP verification failed",
      });
    }
  };

// ==========================
// RESET ADMIN PASSWORD
// ==========================

export const adminResetPassword =
  async (req, res) => {
    try {
      const {
        resetToken,
        newPassword,
      } = req.body;

      if (
        !resetToken ||
        !newPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Reset token and new password are required",
        });
      }

      const result =
        await resetAdminPassword(
          resetToken,
          newPassword
        );

      return res.status(200).json({
        success: true,
        message:
          result.message,
      });
    } catch (error) {
      console.error(
        "Admin password reset error:",
        error.message
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Unable to reset admin password",
      });
    }
  };