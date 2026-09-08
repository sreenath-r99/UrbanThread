import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

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
  // Check if user already exists
  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    throw new Error(
      "User already exists with this email"
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    password,
    10
  );

  // Generate OTP
  const otp = generateOTP();

  // OTP expires in 10 minutes
  const otpExpires = new Date(
    Date.now() + 10 * 60 * 1000
  );

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    isVerified: false,
    otp,
    otpExpires,
  });

  // Return user and OTP
  return {
    user,
    otp,
  };
};

// ==========================
// VERIFY OTP
// ==========================
export const verifyOTP = async (
  email,
  otp
) => {
  // Find user and explicitly include OTP fields
  const user = await User.findOne({
    email,
  }).select("+otp +otpExpires");

  // Check whether user exists
  if (!user) {
    throw new Error("User not found");
  }

  // Check if user is already verified
  if (user.isVerified) {
    throw new Error(
      "User is already verified"
    );
  }

  // Check if OTP exists
  if (!user.otp) {
    throw new Error("OTP not found");
  }

  // Check whether OTP is correct
  if (user.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  // Check OTP expiry
  if (
    !user.otpExpires ||
    user.otpExpires < new Date()
  ) {
    throw new Error("OTP has expired");
  }

  // Verify user
  user.isVerified = true;

  // Remove OTP after successful verification
  user.otp = undefined;
  user.otpExpires = undefined;

  // Save updated user
  await user.save();

  // IMPORTANT:
  // Return the actual user because
  // authController expects user._id, user.name, etc.
  return user;
};

// ==========================
// RESEND OTP
// ==========================
export const resendOTP = async (email) => {
  // Find user and explicitly include hidden OTP fields
  const user = await User.findOne({ email }).select(
    "+otp +otpExpires"
  );

  // Check whether user exists
  if (!user) {
    throw new Error("User not found");
  }

  // Prevent resending OTP for already verified users
  if (user.isVerified) {
    throw new Error("User is already verified");
  }

  // Generate new OTP
  const otp = generateOTP();

  // Set new expiry time (10 minutes)
  const otpExpires = new Date(
    Date.now() + 10 * 60 * 1000
  );

  // Update user OTP
  user.otp = otp;
  user.otpExpires = otpExpires;

  // Save updated user
  await user.save();

  // Return OTP temporarily for development testing
  return {
    otp,
  };
};

// ==========================
// FORGOT PASSWORD
// ==========================

export const forgotPassword = async (email) => {
  // Find user by email
  const user = await User.findOne({ email });

  // Check if user exists
  if (!user) {
    throw new Error("User not found with this email");
  }

  // Generate new OTP
  const otp = generateOTP();

  // OTP expires in 10 minutes
  const otpExpires = new Date(
    Date.now() + 10 * 60 * 1000
  );

  // Save OTP and expiry
  user.otp = otp;
  user.otpExpires = otpExpires;

  await user.save();

  // Temporary: return OTP for development testing
  return {
    message: "Password reset OTP generated successfully",
    otp,
  };
};

// ==========================
// LOGIN USER
// ==========================
export const loginUser = async (
  email,
  password
) => {
  // Find user
  // +password is important if password
  // has select: false in User model
  const user = await User.findOne({
    email,
  }).select("+password");

  // Check whether user exists
  if (!user) {
    throw new Error(
      "Invalid email or password"
    );
  }

  // Compare entered password
  // with hashed password
  const isPasswordMatch =
    await bcrypt.compare(
      password,
      user.password
    );

  // Check password
  if (!isPasswordMatch) {
    throw new Error(
      "Invalid email or password"
    );
  }

  // Check whether user is blocked
  if (user.isBlocked) {
    throw new Error(
      "Your account has been blocked"
    );
  }

  // Check whether email is verified
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

  // Generate JWT token
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

  // Return actual user and token
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
  // Find user and include hidden OTP fields
  const user = await User.findOne({ email }).select(
    "+otp +otpExpires"
  );

  // Check whether user exists
  if (!user) {
    throw new Error("User not found");
  }

  // Check whether OTP exists
  if (!user.otp) {
    throw new Error("OTP not found");
  }

  // Check whether OTP is correct
  if (user.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  // Check whether OTP has expired
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

  // Remove OTP after successful password reset
  user.otp = undefined;
  user.otpExpires = undefined;

  // Save updated user
  await user.save();

  return {
    message: "Password reset successfully",
  };
};