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
// AUTH ROUTES
// ==========================

router.post(
  "/register",
  register
);

router.post(
  "/verify-otp",
  verifyOtp
);

router.post(
  "/login",
  login
);

router.post(
  "/google",
  googleAuth
);

// ==========================
// PROTECTED USER ROUTES
// ==========================

router.get(
  "/profile",
  protect,
  getProfile
);

router.put(
  "/profile",
  protect,
  upload.single("profileImage"),
  updateProfile
);

router.put(
  "/change-password",
  protect,
  changePassword
);

// ==========================
// CHANGE EMAIL ROUTES
// ==========================

// Request an OTP for changing the email
router.post(
  "/request-email-change",
  protect,
  requestChangeEmail
);

// Verify the OTP and update the email
router.post(
  "/verify-email-change",
  protect,
  verifyChangeEmailOtp
);

// ==========================
// PASSWORD RESET ROUTES
// ==========================

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/verify-reset-otp",
  verifyResetOtp
);

router.post(
  "/reset-password",
  resetPassword
);

// ==========================
// RESEND REGISTRATION OTP
// ==========================

router.post(
  "/resend-otp",
  resendOtp
);

export default router;