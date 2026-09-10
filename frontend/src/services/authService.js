import api from "./api";

// ==========================
// REGISTER USER
// ==========================

export const registerUser = async (
  userData
) => {
  const response = await api.post(
    "/auth/register",
    userData
  );

  return response.data;
};


// ==========================
// VERIFY REGISTER OTP
// ==========================

export const verifyOtp = async (
  otpData
) => {
  const response = await api.post(
    "/auth/verify-otp",
    otpData
  );

  return response.data;
};


// ==========================
// RESEND REGISTER OTP
// ==========================

export const resendOtp = async (
  emailData
) => {
  const response = await api.post(
    "/auth/resend-otp",
    emailData
  );

  return response.data;
};


// ==========================
// LOGIN USER
// ==========================

export const loginUser = async (
  loginData
) => {
  const response = await api.post(
    "/auth/login",
    loginData
  );

  return response.data;
};


// ==========================
// GOOGLE AUTH
// ==========================

export const googleAuth = async (
  credential
) => {
  const response = await api.post(
    "/auth/google",
    {
      credential,
    }
  );

  return response.data;
};


// ==========================
// GET USER PROFILE
// ==========================

export const getProfile = async (
  token
) => {
  const response = await api.get(
    "/auth/profile",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};


// ==========================
// FORGOT PASSWORD
// ==========================

export const forgotPassword = async (
  email
) => {
  const response = await api.post(
    "/auth/forgot-password",
    {
      email,
    }
  );

  return response.data;
};


// ==========================
// RESET PASSWORD
// ==========================

export const resetPassword = async (
  resetData
) => {
  const response = await api.post(
    "/auth/reset-password",
    resetData
  );

  return response.data;
};