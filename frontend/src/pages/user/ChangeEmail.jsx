import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";

import {
  requestEmailChange,
  verifyEmailChange,
} from "../../services/authService";

const ChangeEmail = () => {
  const navigate = useNavigate();

  const { user, token, setUser } = useContext(AuthContext);

  const [currentPassword, setCurrentPassword] = useState("");

  const [newEmail, setNewEmail] = useState("");

  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ==========================
  // REQUEST EMAIL CHANGE
  // ==========================

  const handleRequestEmailChange = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedEmail = newEmail.trim().toLowerCase();

    if (!currentPassword.trim()) {
      setError("Current password is required");
      return;
    }

    if (!trimmedEmail) {
      setError("New email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    if (trimmedEmail === user?.email) {
      setError("New email must be different from your current email");
      return;
    }

    try {
      setLoading(true);

      const response = await requestEmailChange(
        {
          currentPassword,
          newEmail: trimmedEmail,
        },
        token,
      );

      setNewEmail(trimmedEmail);
      setOtpSent(true);
      setSuccess(response.message);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to send email change OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // VERIFY EMAIL CHANGE OTP
  // ==========================

  const handleVerifyEmailChange = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedOtp = otp.trim();

    if (!trimmedOtp) {
      setError("OTP is required");
      return;
    }

    if (!/^\d{6}$/.test(trimmedOtp)) {
      setError("OTP must contain 6 digits");
      return;
    }

    try {
      setLoading(true);

      const response = await verifyEmailChange(
        {
          otp: trimmedOtp,
        },
        token,
      );

      // Update the user in AuthContext
      if (response.user) {
        setUser(response.user);
      }

      setSuccess("Email changed successfully");

      setTimeout(() => {
        navigate("/profile/edit");
      }, 1200);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to verify email change OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 py-10"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=80')",
      }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-wide text-gray-900">
              URBANTHREAD
            </h1>

            <h2 className="mt-3 text-xl font-semibold text-gray-800">
              Change Email
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Update your account email securely
            </p>
          </div>

          {/* Current Email */}
          <div className="mb-6 rounded-lg bg-gray-100 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Current Email
            </p>

            <p className="mt-1 break-all text-sm font-medium text-gray-800">
              {user?.email}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
              {success}
            </div>
          )}

          {!otpSent ? (
            // ==========================
            // REQUEST OTP FORM
            // ==========================
            <form onSubmit={handleRequestEmailChange} className="space-y-5">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Current Password
                </label>

                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="newEmail"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  New Email Address
                </label>

                <input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(event) => setNewEmail(event.target.value)}
                  placeholder="Enter new email address"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending OTP..." : "Send Verification OTP"}
              </button>
            </form>
          ) : (
            // ==========================
            // VERIFY OTP FORM
            // ==========================
            <form onSubmit={handleVerifyEmailChange} className="space-y-5">
              <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
                A verification OTP has been sent to:
                <br />
                <span className="font-semibold break-all">{newEmail}</span>
              </div>

              <div>
                <label
                  htmlFor="otp"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Verification OTP
                </label>

                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Enter 6-digit OTP"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-lg tracking-[0.4em] outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify and Change Email"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                  setError("");
                  setSuccess("");
                }}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Change Email Address
              </button>
            </form>
          )}

          {/* Back Link */}
          <div className="mt-7 text-center">
            <Link
              to="/profile/edit"
              className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
            >
              ← Back to Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeEmail;
