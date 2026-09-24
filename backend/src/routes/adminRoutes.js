import express from "express";

import {
  adminLogin,
  adminForgotPassword,
  adminVerifyResetOtp,
  adminResetPassword,
} from "../controllers/adminController.js";

const router = express.Router();

// ==========================
// ADMIN LOGIN
// ==========================

router.post("/login", adminLogin);

// ==========================
// ADMIN FORGOT PASSWORD
// ==========================

router.post("/forgot-password", adminForgotPassword);

// ==========================
// ADMIN VERIFY RESET OTP
// ==========================

router.post("/verify-reset-otp", adminVerifyResetOtp);

// ==========================
// ADMIN RESET PASSWORD
// ==========================

router.post("/reset-password", adminResetPassword);

export default router;
