import express from "express";

import {
  register,
  verifyOtp,
  login,
  googleAuth,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  resendOtp,
  requestChangeEmail,
  verifyChangeEmailOtp,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ==========================
// PUBLIC AUTH ROUTES
// ==========================

// Register user
router.post(
  "/register",
  register
);

// Verify registration OTP
router.post(
  "/verify-otp",
  verifyOtp
);

// User login
router.post(
  "/login",
  login
);

// Google authentication
router.post(
  "/google",
  googleAuth
);

// ==========================
// PROTECTED USER ROUTES
// ==========================

// Get user profile
router.get(
  "/profile",
  protect,
  getProfile
);

// Update user profile with optional profile image
router.put(
  "/profile",
  protect,
  upload.single("profileImage"),
  updateProfile
);

// Change password
router.put(
  "/change-password",
  protect,
  changePassword
);

// ==========================
// CHANGE EMAIL ROUTES
// ==========================

// Request OTP for changing email
router.post(
  "/request-email-change",
  protect,
  requestChangeEmail
);

// Verify OTP and update email
router.post(
  "/verify-email-change",
  protect,
  verifyChangeEmailOtp
);

// ==========================
// PASSWORD RESET ROUTES
// ==========================

// Request forgot-password OTP
router.post(
  "/forgot-password",
  forgotPassword
);

// Verify forgot-password OTP
router.post(
  "/verify-reset-otp",
  verifyResetOtp
);

// Reset password
router.post(
  "/reset-password",
  resetPassword
);

// ==========================
// RESEND REGISTRATION OTP
// ==========================

// Resend registration OTP
router.post(
  "/resend-otp",
  resendOtp
);

export default router;