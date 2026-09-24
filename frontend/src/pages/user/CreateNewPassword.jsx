import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { resetPassword } from "../../services/authService";

const CreateNewPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";
  const otp = location.state?.otp || "";

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    // Check route data
    if (!email || !otp) {
      setError("Your reset session has expired. Please request a new OTP.");

      return;
    }

    // Password validation
    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields.");

      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");

      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");

      return;
    }

    try {
      setLoading(true);

      await resetPassword({
        email,
        otp,
        newPassword,
      });

      // Password successfully reset
      navigate("/login", {
        replace: true,
        state: {
          message:
            "Password reset successfully. Please log in with your new password.",
        },
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to reset password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#111112]">
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#171717] via-[#101112] to-[#161616]" />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/35" />

      {/* OPTIONAL FASHION / STORE ATMOSPHERE */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(80,80,80,0.12),transparent_30%),radial-gradient(circle_at_85%_25%,rgba(70,70,70,0.10),transparent_25%),radial-gradient(circle_at_70%_85%,rgba(60,60,60,0.08),transparent_30%)]" />

      {/* CONTENT */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        {/* CARD */}
        <div className="w-full max-w-md rounded-lg border border-[#303034] bg-[#1b1b1d]/95 px-7 py-8 shadow-2xl backdrop-blur-sm md:px-10 md:py-9">
          {/* BRAND */}
          <div className="mb-6 text-center">
            <h1 className="font-serif text-sm font-medium text-[#ded8d1]">
              UrbanThread
            </h1>
          </div>

          {/* TITLE */}
          <h2 className="text-center text-2xl md:text-3xl font-serif font-semibold text-[#ded8d1]">
            Create a New Password
          </h2>

          {/* DESCRIPTION */}
          <p className="mt-3 text-center text-sm leading-6 text-gray-400">
            Choose a strong password for your
            <br />
            UrbanThread account.
          </p>

          {/* ERROR */}
          {error && (
            <div className="mt-5 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="mt-8">
            {/* NEW PASSWORD */}
            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-[10px] font-bold tracking-[0.12em] text-gray-400"
              >
                NEW PASSWORD
              </label>

              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);

                    setError("");
                  }}
                  className="w-full rounded-sm border border-[#353539] bg-[#f4f4f5] px-4 py-3 pr-12 text-sm text-[#202020] outline-none transition placeholder:text-gray-400 focus:border-gray-500"
                />

                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label="Toggle password visibility"
                >
                  {showNewPassword ? "◉" : "◌"}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="mt-5">
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-[10px] font-bold tracking-[0.12em] text-gray-400"
              >
                CONFIRM PASSWORD
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);

                    setError("");
                  }}
                  className="w-full rounded-sm border border-[#353539] bg-[#f4f4f5] px-4 py-3 pr-12 text-sm text-[#202020] outline-none transition placeholder:text-gray-400 focus:border-gray-500"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? "◉" : "◌"}
                </button>
              </div>
            </div>

            {/* RESET BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="mt-7 w-full rounded-sm bg-[#d9d5d0] py-3 text-xs font-bold tracking-[0.15em] text-[#252525] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "RESETTING PASSWORD..." : "RESET PASSWORD"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateNewPassword;
