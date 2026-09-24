import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { resetAdminPassword } from "../../services/adminService";

const AdminResetPassword = () => {
  const navigate = useNavigate();

  const [resetToken, setResetToken] = useState("");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==========================
  // LOAD RESET TOKEN
  // ==========================

  useEffect(() => {
    const token = sessionStorage.getItem("adminResetToken");

    if (!token) {
      navigate("/admin/forgot-password", {
        replace: true,
      });

      return;
    }

    setResetToken(token);
  }, [navigate]);

  // ==========================
  // INPUT CHANGE
  // ==========================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ==========================
  // VALIDATION
  // ==========================

  const validateForm = () => {
    if (!formData.newPassword) {
      setError("New password is required");

      return false;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");

      return false;
    }

    if (!formData.confirmPassword) {
      setError("Please confirm your new password");

      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");

      return false;
    }

    return true;
  };

  // ==========================
  // SUBMIT
  // ==========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    if (!resetToken) {
      setError("Password reset session is invalid. Please start again.");

      return;
    }

    try {
      setIsSubmitting(true);

      const response = await resetAdminPassword(
        resetToken,
        formData.newPassword,
      );

      if (!response?.success) {
        throw new Error(response?.message || "Unable to reset password");
      }

      // Clear reset session
      sessionStorage.removeItem("adminResetEmail");

      sessionStorage.removeItem("adminResetToken");

      setSuccess("Password reset successfully. Redirecting to admin login...");

      setTimeout(() => {
        navigate("/admin/login", {
          replace: true,
        });
      }, 1500);
    } catch (error) {
      console.error("Admin reset password error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to reset password",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="border border-[#292929] bg-[#1b1b1b] px-7 py-8 shadow-2xl sm:px-10 sm:py-10">
            {/* PORTAL BADGE */}

            <div className="mb-7 flex justify-center">
              <span className="rounded-full border border-[#353535] px-4 py-1 text-[10px] font-medium tracking-[0.2em] text-neutral-400">
                ADMIN PORTAL
              </span>
            </div>

            {/* HEADING */}

            <div className="mb-8 text-center">
              <h2 className="font-serif text-3xl text-white">
                Create New Password
              </h2>

              <p className="mt-3 text-sm leading-6 text-neutral-400">
                Choose a new password for your admin account.
              </p>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-5 border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="mb-5 border border-green-900/60 bg-green-950/30 px-4 py-3 text-sm text-green-300">
                {success}
              </div>
            )}

            {/* FORM */}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* NEW PASSWORD */}

              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-300"
                >
                  New Password
                </label>

                <div className="flex items-center border border-[#303030] bg-[#111111]">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((previousValue) => !previousValue)
                    }
                    className="mr-3 text-neutral-500 transition hover:text-white"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? "◉" : "◌"}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-300"
                >
                  Confirm Password
                </label>

                <div className="flex items-center border border-[#303030] bg-[#111111]">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((previousValue) => !previousValue)
                    }
                    className="mr-3 text-neutral-500 transition hover:text-white"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? "◉" : "◌"}
                  </button>
                </div>
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#e8e5e0] py-3 text-xs font-semibold tracking-[0.18em] text-[#171717] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "UPDATING..." : "UPDATE PASSWORD"}
              </button>
            </form>

            {/* BACK */}

            <div className="mt-7 text-center">
              <Link
                to="/admin/login"
                className="text-xs text-neutral-500 transition hover:text-white"
              >
                ← Back to Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminResetPassword;
