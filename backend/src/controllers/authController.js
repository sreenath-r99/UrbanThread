import {
  registerUser,
  loginUser,
  googleAuthUser,
  verifyOTP,
  resendOTP,
  forgotPassword as forgotPasswordService,
  verifyResetOtp as verifyResetOtpService,
  resetPassword as resetPasswordService,
  updateUserProfile,
  changeUserPassword,
  requestEmailChange,
  verifyEmailChangeOtp,
} from "../services/authService.js";

import { uploadProfileImage } from "../services/cloudinaryService.js";
// ==========================
// REGISTER USER
// ==========================

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("REGISTER STEP 1: Request received");

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    console.log("REGISTER STEP 2: Calling registerUser");

    // Register user and generate OTP
    const { user } = await registerUser(
      name,
      email,
      password
    );

    console.log(
      "REGISTER STEP 3: User registered successfully"
    );

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Please verify your OTP.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error(
      "REGISTER ERROR:",
      error.message
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// LOGIN USER
// ==========================

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    // Call login service
    const { user, token } =
      await loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error.message
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// GET USER PROFILE
// ==========================

export const getProfile = async (
  req,
  res
) => {
  try {
    return res.status(200).json({
      success: true,
      message:
        "Profile fetched successfully",
      user: req.user,
    });
  } catch (error) {
    console.error(
      "PROFILE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong",
    });
  }
};

// ==========================
// VERIFY OTP
// ==========================

export const verifyOtp = async (
  req,
  res
) => {
  try {
    const { email, otp } = req.body;

    // Basic validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Email and OTP are required",
      });
    }

    // Verify OTP
    const user = await verifyOTP(
      email,
      otp
    );

    return res.status(200).json({
      success: true,
      message:
        "Email verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error(
      "VERIFY OTP ERROR:",
      error.message
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// RESEND OTP
// ==========================

export const resendOtp = async (
  req,
  res
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          "Email is required",
      });
    }

    const result =
      await resendOTP(email);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error(
      "RESEND OTP ERROR:",
      error.message
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// FORGOT PASSWORD
// ==========================

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result =
      await forgotPasswordService(email);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error(
      "FORGOT PASSWORD ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// VERIFY RESET OTP
// ==========================

export const verifyResetOtp = async (
  req,
  res
) => {
  try {
    const { email, otp } = req.body;

    // Basic validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Email and OTP are required",
      });
    }

    const result =
      await verifyResetOtpService(
        email,
        otp
      );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// RESET PASSWORD
// ==========================

export const resetPassword = async (
  req,
  res
) => {
  try {
    const {
      email,
      otp,
      newPassword,
    } = req.body;

    // Basic validation
    if (
      !email ||
      !otp ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email, OTP and new password are required",
      });
    }

    // Password validation
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    // Reset password
    const result =
      await resetPasswordService(
        email,
        otp,
        newPassword
      );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error(
      "RESET PASSWORD ERROR:",
      error.message
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// GOOGLE LOGIN / REGISTER
// ==========================

export const googleAuth = async (
  req,
  res
) => {
  try {
    const { credential } = req.body;

    // Check Google credential
    if (!credential) {
      return res.status(400).json({
        success: false,
        message:
          "Google credential is required",
      });
    }

    console.log(
      "GOOGLE AUTH STEP 1: Credential received"
    );

    // Authenticate user with Google
    const { user, token } =
      await googleAuthUser(
        credential
      );

    console.log(
      "GOOGLE AUTH STEP 2: User authenticated:",
      user.email
    );

    return res.status(200).json({
      success: true,
      message:
        "Google authentication successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        googleImage:
          user.googleImage || null,
      },
    });
  } catch (error) {
    console.error(
      "GOOGLE AUTH CONTROLLER ERROR:",
      error.message
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// UPDATE USER PROFILE
// ==========================

export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    let profileImageUrl;

    if (req.file) {
      const cloudinaryResult = await uploadProfileImage(
        req.file.buffer,
        req.user._id.toString()
      );

      profileImageUrl = cloudinaryResult.secure_url;
    }

    const result = await updateUserProfile(
      req.user._id,
      name,
      phone,
      profileImageUrl
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      message: error.message || "Failed to update profile",
    });
  }
};

// ==========================
// CHANGE PASSWORD
// ==========================

export const changePassword = async (
  req,
  res
) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters",
      });
    }

    const result = await changeUserPassword(
      req.user._id,
      currentPassword,
      newPassword
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error(
      "CHANGE PASSWORD ERROR:",
      error.message
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// REQUEST EMAIL CHANGE
// ==========================

export const requestChangeEmail = async (
  req,
  res
) => {
  try {
    const {
      currentPassword,
      newEmail,
    } = req.body;

    if (!currentPassword || !newEmail) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new email are required",
      });
    }

    const result = await requestEmailChange(
      req.user._id,
      currentPassword,
      newEmail
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error(
      "REQUEST EMAIL CHANGE ERROR:",
      error.message
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// VERIFY EMAIL CHANGE OTP
// ==========================

export const verifyChangeEmailOtp = async (
  req,
  res
) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    const user = await verifyEmailChangeOtp(
      req.user._id,
      otp
    );

    return res.status(200).json({
      success: true,
      message: "Email changed successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        googleImage: user.googleImage,
        role: user.role,
        isVerified: user.isVerified,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error(
      "VERIFY EMAIL CHANGE OTP ERROR:",
      error.message
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

