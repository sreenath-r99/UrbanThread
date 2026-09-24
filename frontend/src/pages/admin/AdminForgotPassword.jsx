import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { forgotAdminPassword } from "../../services/adminService";

const AdminForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const trimmedEmail = email.trim().toLowerCase();

    // ==========================
    // VALIDATION
    // ==========================

    if (!trimmedEmail) {
      setError("Admin email is required");

      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Enter a valid email address");

      return;
    }

    // ==========================
    // SEND OTP
    // ==========================

    try {
      setIsSubmitting(true);

      const response = await forgotAdminPassword(trimmedEmail);

      if (!response?.success) {
        throw new Error(response?.message || "Unable to send OTP");
      }

      // Store email only after
      // backend confirms admin exists
      sessionStorage.setItem("adminResetEmail", trimmedEmail);

      // Remove old reset token
      sessionStorage.removeItem("adminResetToken");

      navigate("/admin/verify-reset-otp");
    } catch (error) {
      console.error("Admin forgot password error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to process password reset request",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ==========================
            IMAGE SECTION
        ========================== */}

        <div
          className="relative hidden min-h-screen bg-cover bg-center lg:block"
          style={{
            backgroundImage: "url('/admin-login.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/10" />

          <div className="absolute bottom-10 left-10">
            <h1 className="font-serif text-4xl font-semibold tracking-wide text-white">
              UrbanThread
            </h1>

            <p className="mt-3 text-sm tracking-wide text-neutral-300">
              Wear Your Style.
            </p>
          </div>
        </div>

        {/* ==========================
            FORM SECTION
        ========================== */}

        <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
          <div className="absolute right-8 top-8 flex gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-700" />
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-700" />
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-700" />
          </div>

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
                  Forgot Password
                </h2>

                <p className="mt-3 text-sm leading-6 text-neutral-400">
                  Enter your admin email and we'll send you a verification code.
                </p>
              </div>

              {/* ERROR */}

              {error && (
                <div className="mb-5 border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* FORM */}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-300"
                  >
                    Admin Email
                  </label>

                  <div className="flex items-center border border-[#303030] bg-[#1b1b1b] transition focus-within:border-neutral-500">
                    <span className="pl-3 text-neutral-500">✉</span>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Enter your admin email"
                      autoComplete="email"
                      className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-neutral-600"
                    />
                  </div>
                </div>

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#e8e5e0] py-3 text-xs font-semibold tracking-[0.18em] text-[#171717] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "SENDING..." : "SEND OTP"}
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
    </div>
  );
};

export default AdminForgotPassword;
