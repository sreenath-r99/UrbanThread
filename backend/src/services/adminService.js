import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import Admin from "../models/Admin.js";

import { sendAdminPasswordResetOtpEmail } from "./emailService.js";

// ==========================
// GENERATE OTP
// ==========================

const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

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
    throw new Error("This admin account does not support password login");
  }

  const isPasswordMatch = await bcrypt.compare(password, admin.password);

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
    },
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

// ==========================
// FORGOT ADMIN PASSWORD
// ==========================

export const forgotAdminPassword = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  const admin = await Admin.findOne({
    email: normalizedEmail,
  });

  // Only registered admin accounts
  // can continue with password reset.
  if (!admin) {
    throw new Error("No admin account found with this email");
  }

  if (admin.isBlocked) {
    throw new Error("This admin account has been blocked");
  }

  // Generate OTP
  const otp = generateOtp();

  // Hash OTP before storing it
  const otpHash = await bcrypt.hash(otp, 10);

  // OTP expires after 10 minutes
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  admin.passwordResetOtpHash = otpHash;

  admin.passwordResetOtpExpiresAt = expiresAt;

  await admin.save();

  try {
    await sendAdminPasswordResetOtpEmail(admin.email, admin.name, otp);
  } catch (error) {
    // Clear OTP if email sending fails
    admin.passwordResetOtpHash = null;

    admin.passwordResetOtpExpiresAt = null;

    await admin.save();

    console.error("ADMIN RESET EMAIL ERROR:", error);

    throw new Error("Unable to send password reset email");
  }

  return {
    message: "Password reset OTP sent to your admin email",
  };
};

// ==========================
// VERIFY ADMIN RESET OTP
// ==========================

export const verifyAdminResetOtp = async (email, otp) => {
  const normalizedEmail = email.trim().toLowerCase();

  const admin = await Admin.findOne({
    email: normalizedEmail,
  });

  if (!admin) {
    throw new Error("Invalid or expired OTP");
  }

  if (!admin.passwordResetOtpHash || !admin.passwordResetOtpExpiresAt) {
    throw new Error("No password reset request found");
  }

  // Check expiry
  if (admin.passwordResetOtpExpiresAt < new Date()) {
    admin.passwordResetOtpHash = null;

    admin.passwordResetOtpExpiresAt = null;

    await admin.save();

    throw new Error("OTP has expired. Please request a new OTP");
  }

  // Compare entered OTP with hashed OTP
  const isOtpCorrect = await bcrypt.compare(
    String(otp),
    admin.passwordResetOtpHash,
  );

  if (!isOtpCorrect) {
    throw new Error("Invalid OTP");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  // Generate short-lived reset token
  const resetToken = jwt.sign(
    {
      adminId: admin._id,
      accountType: "admin",
      purpose: "admin-password-reset",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "10m",
    },
  );

  // OTP cannot be reused
  admin.passwordResetOtpHash = null;

  admin.passwordResetOtpExpiresAt = null;

  await admin.save();

  return {
    resetToken,
  };
};

// ==========================
// RESET ADMIN PASSWORD
// ==========================

export const resetAdminPassword = async (resetToken, newPassword) => {
  if (!resetToken) {
    throw new Error("Password reset token is required");
  }

  if (!newPassword) {
    throw new Error("New password is required");
  }

  if (newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  let decoded;

  try {
    decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("Password reset session has expired. Please start again");
  }

  if (
    !decoded.adminId ||
    decoded.accountType !== "admin" ||
    decoded.purpose !== "admin-password-reset"
  ) {
    throw new Error("Invalid password reset token");
  }

  const admin = await Admin.findById(decoded.adminId).select("+password");

  if (!admin) {
    throw new Error("Admin account not found");
  }

  if (admin.isBlocked) {
    throw new Error("This admin account has been blocked");
  }

  // Prevent using the same password
  if (admin.password) {
    const isSamePassword = await bcrypt.compare(newPassword, admin.password);

    if (isSamePassword) {
      throw new Error(
        "New password must be different from the current password",
      );
    }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  admin.password = hashedPassword;

  admin.passwordResetOtpHash = null;

  admin.passwordResetOtpExpiresAt = null;

  await admin.save();

  return {
    message: "Admin password reset successfully",
  };
};
