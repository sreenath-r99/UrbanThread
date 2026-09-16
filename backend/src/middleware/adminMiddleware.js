import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

// ==========================
// ADMIN AUTHENTICATION
// ==========================

export const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Admin token not found",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (
      !decoded.adminId ||
      decoded.accountType !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Invalid admin token",
      });
    }

    const admin = await Admin.findById(
      decoded.adminId
    ).select("-password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin account not found",
      });
    }

    if (admin.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "This admin account has been blocked",
      });
    }

    req.admin = admin;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin token",
    });
  }
};