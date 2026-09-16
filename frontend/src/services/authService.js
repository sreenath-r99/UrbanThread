import api from "./api";

// =====================================================
// USER REGISTRATION
// =====================================================

export const registerUser = async (registerData) => {
  const response = await api.post("/auth/register", registerData);
  return response.data;
};

// =====================================================
// OTP VERIFICATION
// =====================================================

export const verifyOtp = async (otpData) => {
  const response = await api.post("/auth/verify-otp", otpData);
  return response.data;
};

export const resendOtp = async (otpData) => {
  const response = await api.post("/auth/resend-otp", otpData);
  return response.data;
};

// =====================================================
// LOGIN
// =====================================================

export const loginUser = async (loginData) => {
  const response = await api.post("/auth/login", loginData);
  return response.data;
};

// =====================================================
// GOOGLE LOGIN
// =====================================================

export const googleLogin = async (googleData) => {
  const response = await api.post("/auth/google", googleData);
  return response.data;
};

// =====================================================
// PROFILE
// =====================================================

export const getProfile = async (token) => {
  const response = await api.get("/auth/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const updateProfile = async (profileData, token) => {
  const response = await api.put("/auth/profile", profileData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// =====================================================
// CHANGE PASSWORD
// =====================================================

export const changePassword = async (passwordData, token) => {
  const response = await api.put("/auth/change-password", passwordData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// =====================================================
// CHANGE EMAIL
// =====================================================

export const requestEmailChange = async (emailChangeData, token) => {
  const response = await api.post(
    "/auth/request-email-change",
    emailChangeData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const verifyEmailChange = async (otpData, token) => {
  const response = await api.post(
    "/auth/verify-email-change",
    otpData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// =====================================================
// FORGOT PASSWORD
// =====================================================

export const forgotPassword = async (emailData) => {
  const response = await api.post(
    "/auth/forgot-password",
    emailData
  );

  return response.data;
};

// =====================================================
// RESET PASSWORD
// =====================================================

export const resetPassword = async (resetData) => {
  const response = await api.post(
    "/auth/reset-password",
    resetData
  );

  return response.data;
};

// =====================================================
// ADDRESS MANAGEMENT
// =====================================================

// Get all addresses
export const getAddresses = async (token) => {
  const response = await api.get("/addresses", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Get one address
export const getAddress = async (addressId, token) => {
  const response = await api.get(`/addresses/${addressId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Add new address
export const createAddress = async (addressData, token) => {
  const response = await api.post("/addresses", addressData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Update address
export const updateAddress = async (
  addressId,
  addressData,
  token
) => {
  const response = await api.put(
    `/addresses/${addressId}`,
    addressData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// Delete address
export const deleteAddress = async (addressId, token) => {
  const response = await api.delete(`/addresses/${addressId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Set default address
export const setDefaultAddress = async (addressId, token) => {
  const response = await api.patch(
    `/addresses/${addressId}/default`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};