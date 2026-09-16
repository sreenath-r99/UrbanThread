import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Admin from "../models/Admin.js";

// ==========================
// ADMIN LOGIN
// ==========================

export const loginAdmin = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();

  const admin = await Admin.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!admin) {
    throw new Error("Invalid admin email or password");
  }

  if (admin.isBlocked) {
    throw new Error("This admin account has been blocked");
  }

  if (!admin.password) {
    throw new Error(
      "This admin account does not support password login"
    );
  }

  const isPasswordMatch = await bcrypt.compare(
    password,
    admin.password
  );

  if (!isPasswordMatch) {
    throw new Error("Invalid admin email or password");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign(
    {
      adminId: admin._id,
      accountType: "admin",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      profileImage: admin.profileImage,
      isVerified: admin.isVerified,
    },
  };
};