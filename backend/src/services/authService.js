import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

import User from "../models/User.js";
import {
  sendOtpEmail,
  sendPasswordResetOtpEmail,
} from "./emailService.js";

// ==========================
// GOOGLE OAUTH CLIENT
// ==========================

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// ==========================
// GENERATE 6-DIGIT OTP
// ==========================

const generateOTP = () => {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
};

// ==========================
// REGISTER USER
// ==========================

export const registerUser = async (
  name,
  email,
  password
) => {
  // Normalize email
  const normalizedEmail = email
    .trim()
    .toLowerCase();

  // Check if user already exists
  const existingUser = await User.findOne({
    email: normalizedEmail,
  }).select("+otp +otpExpires");

  // Generate OTP
  const otp = generateOTP();

  // OTP expires in 10 minutes
  const otpExpires = new Date(
    Date.now() + 10 * 60 * 1000
  );

  // ==========================
  // EXISTING USER
  // ==========================

  if (existingUser) {
    // Prevent registration if user
    // is already verified
    if (existingUser.isVerified) {
      throw new Error(
        "User already exists with this email"
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Update existing unverified user
    existingUser.name = name;
    existingUser.password = hashedPassword;
    existingUser.authProvider = "local";
    existingUser.otp = otp;
    existingUser.otpExpires = otpExpires;

    await existingUser.save();

    // Send OTP email
    await sendOtpEmail(
      normalizedEmail,
      otp
    );

    return {
      user: existingUser,
    };
  }

  // ==========================
  // NEW USER
  // ==========================

  // Hash password
  const hashedPassword = await bcrypt.hash(
    password,
    10
  );

  // Create user
  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    authProvider: "local",
    isVerified: false,
    otp,
    otpExpires,
  });

  // Send OTP email
  await sendOtpEmail(
    normalizedEmail,
    otp
  );

  return {
    user,
  };
};

// ==========================
// VERIFY OTP
// ==========================

export const verifyOTP = async (
  email,
  otp
) => {
  const normalizedEmail = email
    .trim()
    .toLowerCase();

  // Find user and include OTP fields
  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+otp +otpExpires");

  // Check user
  if (!user) {
    throw new Error("User not found");
  }

  // Check already verified
  if (user.isVerified) {
    throw new Error(
      "User is already verified"
    );
  }

  // Check OTP exists
  if (!user.otp) {
    throw new Error("OTP not found");
  }

  // Check OTP
  if (user.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  // Check expiry
  if (
    !user.otpExpires ||
    user.otpExpires < new Date()
  ) {
    throw new Error("OTP has expired");
  }

  // Verify user
  user.isVerified = true;

  // Remove OTP
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save();

  return user;
};

// ==========================
// RESEND OTP
// ==========================

export const resendOTP = async (email) => {
  const normalizedEmail = email
    .trim()
    .toLowerCase();

  // Find user
  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+otp +otpExpires");

  // Check user
  if (!user) {
    throw new Error("User not found");
  }

  // Check verified
  if (user.isVerified) {
    throw new Error(
      "User is already verified"
    );
  }

  // Generate new OTP
  const otp = generateOTP();

  // OTP expires in 10 minutes
  const otpExpires = new Date(
    Date.now() + 10 * 60 * 1000
  );

  // Update OTP
  user.otp = otp;
  user.otpExpires = otpExpires;

  await user.save();

  // Send OTP email
  await sendOtpEmail(
    normalizedEmail,
    otp
  );

  return {
    message:
      "A new OTP has been sent to your email",
  };
};

// ==========================
// FORGOT PASSWORD
// ==========================

export const forgotPassword = async (email) => {
  const normalizedEmail = email
    .trim()
    .toLowerCase();

  // Find user and include OTP fields
  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+otp +otpExpires");

  // Check whether user exists
  if (!user) {
    throw new Error(
      "No account found with this email"
    );
  }

  // Check whether account is blocked
  if (user.isBlocked) {
    throw new Error(
      "Your account has been blocked"
    );
  }

  // Generate OTP
  const otp = generateOTP();

  // OTP expires in 10 minutes
  const otpExpires = new Date(
    Date.now() + 10 * 60 * 1000
  );

  // Save OTP
  user.otp = otp;
  user.otpExpires = otpExpires;

  await user.save();

  // Send OTP email
  await sendPasswordResetOtpEmail(
    normalizedEmail,
    otp
  );

  return {
    message:
      "Password reset OTP sent to your email",
  };
};

// ==========================
// VERIFY PASSWORD RESET OTP
// ==========================

export const verifyResetOtp = async (
  email,
  otp
) => {
  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+otp +otpExpires");

  // Check user
  if (!user) {
    throw new Error("User not found");
  }

  // Check OTP
  if (!user.otp) {
    throw new Error(
      "No password reset OTP found"
    );
  }

  // Check OTP value
  if (user.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  // Check expiry
  if (
    !user.otpExpires ||
    user.otpExpires < new Date()
  ) {
    throw new Error("OTP has expired");
  }

  return {
    message: "OTP verified successfully",
  };
};

// ==========================
// LOGIN USER
// ==========================

export const loginUser = async (
  email,
  password
) => {
  const normalizedEmail = email
    .trim()
    .toLowerCase();

  // Find user
  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  // Check user
  if (!user) {
    throw new Error(
      "Invalid email or password"
    );
  }

  // Google-only account check
  if (!user.password) {
    throw new Error(
      "This account uses Google login. Please continue with Google."
    );
  }

  // Compare password
  const isPasswordMatch =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!isPasswordMatch) {
    throw new Error(
      "Invalid email or password"
    );
  }

  // Check blocked
  if (user.isBlocked) {
    throw new Error(
      "Your account has been blocked"
    );
  }

  // Check verification
  if (!user.isVerified) {
    throw new Error(
      "Please verify your email before logging in"
    );
  }

  // Check JWT secret
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not configured"
    );
  }

  // Generate JWT
  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    user,
    token,
  };
};

// ==========================
// RESET PASSWORD
// ==========================

export const resetPassword = async (
  email,
  otp,
  newPassword
) => {
  const normalizedEmail = email
    .trim()
    .toLowerCase();

  // Find user
  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+otp +otpExpires +password");

  // Check user
  if (!user) {
    throw new Error("User not found");
  }

  // Check OTP exists
  if (!user.otp) {
    throw new Error("OTP not found");
  }

  // Check OTP
  if (user.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  // Check expiry
  if (
    !user.otpExpires ||
    user.otpExpires < new Date()
  ) {
    throw new Error("OTP has expired");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(
    newPassword,
    10
  );

  // Update password
  user.password = hashedPassword;

  // Remove OTP
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save();

  return {
    message: "Password reset successfully",
  };
};

// ==========================
// GOOGLE LOGIN / REGISTER
// ==========================

export const googleAuthUser = async (
  credential
) => {
  // Check Google Client ID
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error(
      "GOOGLE_CLIENT_ID is not configured"
    );
  }

  // Verify Google credential
  const ticket =
    await googleClient.verifyIdToken({
      idToken: credential,
      audience:
        process.env.GOOGLE_CLIENT_ID,
    });

  // Get Google payload
  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error(
      "Invalid Google credential"
    );
  }

  // Extract Google user details
  const {
    sub: googleId,
    email,
    name,
    picture,
    email_verified,
  } = payload;

  // Check email
  if (!email) {
    throw new Error(
      "Google account email not found"
    );
  }

  // Check Google email verification
  if (!email_verified) {
    throw new Error(
      "Google email is not verified"
    );
  }

  // Normalize email
  const normalizedEmail = email
    .trim()
    .toLowerCase();

  // ==========================
  // FIND EXISTING USER
  // ==========================

  let user = await User.findOne({
    email: normalizedEmail,
  });

  // ==========================
  // EXISTING USER
  // ==========================

  if (user) {
    // Check blocked
    if (user.isBlocked) {
      throw new Error(
        "Your account has been blocked"
      );
    }

    // Link Google ID if missing
    if (!user.googleId) {
      user.googleId = googleId;
    }

    // Update Google image
    if (picture) {
      user.googleImage = picture;
    }

    // Google account is verified
    user.isVerified = true;

    // Save user
    await user.save();
  }

  // ==========================
  // NEW GOOGLE USER
  // ==========================

  if (!user) {
    user = await User.create({
      name: name || "Google User",
      email: normalizedEmail,

      // Google user does not need password
      password: null,

      googleId,

      googleImage:
        picture || "",

      authProvider: "google",

      isVerified: true,

      role: "user",
    });
  }

  // ==========================
  // CHECK JWT SECRET
  // ==========================

  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not configured"
    );
  }

  // ==========================
  // GENERATE JWT TOKEN
  // ==========================

  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  // ==========================
  // RETURN USER AND TOKEN
  // ==========================

  return {
    user,
    token,
  };
};