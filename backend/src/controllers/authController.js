import {
  registerUser,
  loginUser,
  verifyOTP,
  resendOTP,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
} from "../services/authService.js";

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
    const { user, otp } = await registerUser(
      name,
      email,
      password
    );

    console.log("REGISTER STEP 3: User registered successfully");

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your OTP.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },

      // Temporary for development testing
      // Remove after email OTP sending is implemented
      otp,
    });
  } catch (error) {
    console.error("REGISTER ERROR:");
    console.error(error);
    console.error(error.stack);

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
        message: "Email and password are required",
      });
    }

    // Call login service
    const { user, token } = await loginUser(
      email,
      password
    );

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
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// GET USER PROFILE
// ==========================
export const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      user: req.user,
    });
  } catch (error) {
    console.error("PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// ==========================
// VERIFY OTP
// ==========================
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Basic validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Verify OTP
    const user = await verifyOTP(
      email,
      otp
    );

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// RESEND OTP
// ==========================
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Basic validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Generate and save new OTP
    const { otp } = await resendOTP(email);

    return res.status(200).json({
      success: true,
      message: "New OTP generated successfully",
      
      // Temporary for development testing
      // Remove after email sending is implemented
      otp,
    });
  } catch (error) {
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

    const result = await forgotPasswordService(email);

    return res.status(200).json({
      success: true,
      message: result.message,

      // Temporary for development testing
      otp: result.otp,
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

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Basic validation
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Email, OTP and new password are required",
      });
    }

    // Password length validation
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    // Reset password
    const result = await resetPasswordService(
      email,
      otp,
      newPassword
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