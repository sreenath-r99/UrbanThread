import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

// ==========================
// ADMIN AUTHENTICATION
// ==========================

export const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check whether the Authorization header exists
    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Admin token not found",
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Validate admin-specific token payload
    if (
      !decoded.adminId ||
      decoded.accountType !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Invalid admin token",
      });
    }

    // Find the admin using the adminId stored in the token
    const admin = await Admin.findById(
      decoded.adminId
    ).select("-password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin account not found",
      });
    }

    // Check whether the admin account is blocked
    if (admin.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "This admin account has been blocked",
      });
    }

    // Attach admin details to the request
    req.admin = admin;

    // Continue to the controller
    next();
  } catch (error) {
    console.error("Admin authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin token",
    });
  }
};