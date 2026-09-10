import express from "express";

import {
  register,
  login,
  getProfile,
  verifyOtp,
  resendOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  googleAuth,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================
// AUTH ROUTES
// ==========================

router.post("/register", register);

router.post("/verify-otp", verifyOtp);

router.post("/login", login);

router.post("/google", googleAuth);

router.get("/profile", protect, getProfile);

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
// RESEND OTP
// ==========================

router.post(
  "/resend-otp",
  resendOtp
);

export default router;