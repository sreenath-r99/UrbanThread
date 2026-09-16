import { loginAdmin } from "../services/adminService.js";

// ==========================
// ADMIN LOGIN
// ==========================

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await loginAdmin(
      email,
      password
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
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
      message: error.message || "Admin login failed",
    });
  }
};