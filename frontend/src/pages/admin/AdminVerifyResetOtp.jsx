import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  forgotAdminPassword,
  verifyAdminResetOtp,
} from "../../services/adminService";

const AdminVerifyResetOtp = () => {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [error, setError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [resendLoading, setResendLoading] =
    useState(false);

  const [countdown, setCountdown] =
    useState(60);

  // ==========================
  // LOAD EMAIL
  // ==========================

  useEffect(() => {
    const storedEmail =
      sessionStorage.getItem(
        "adminResetEmail"
      );

    if (!storedEmail) {
      navigate(
        "/admin/forgot-password",
        {
          replace: true,
        }
      );

      return;
    }

    setEmail(storedEmail);
  }, [navigate]);

  // ==========================
  // COUNTDOWN
  // ==========================

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer =
      setInterval(() => {
        setCountdown(
          (previousValue) =>
            previousValue - 1
        );
      }, 1000);

    return () =>
      clearInterval(timer);
  }, [countdown]);

  // ==========================
  // VERIFY OTP
  // ==========================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    const trimmedOtp =
      otp.trim();

    if (!trimmedOtp) {
      setError(
        "OTP is required"
      );

      return;
    }

    if (!/^\d{6}$/.test(trimmedOtp)) {
      setError(
        "OTP must contain 6 digits"
      );

      return;
    }

    try {
      setIsSubmitting(true);

      const response =
        await verifyAdminResetOtp(
          email,
          trimmedOtp
        );

      if (
        !response?.success ||
        !response?.resetToken
      ) {
        throw new Error(
          response?.message ||
            "OTP verification failed"
        );
      }

      sessionStorage.setItem(
        "adminResetToken",
        response.resetToken
      );

      navigate(
        "/admin/reset-password"
      );
    } catch (error) {
      console.error(
        "Admin OTP verification error:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Invalid or expired OTP"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================
  // RESEND OTP
  // ==========================

  const handleResend = async () => {
    if (countdown > 0) {
      return;
    }

    if (!email) {
      return;
    }

    setError("");

    try {
      setResendLoading(true);

      const response =
        await forgotAdminPassword(
          email
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to resend OTP"
        );
      }

      setCountdown(60);
      setOtp("");
    } catch (error) {
      console.error(
        "Admin resend OTP error:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to resend OTP"
      );
    } finally {
      setResendLoading(false);
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
                Verify OTP
              </h2>

              <p className="mt-3 text-sm leading-6 text-neutral-400">
                Enter the 6-digit code sent to
              </p>

              <p className="mt-1 break-all text-sm text-neutral-300">
                {email}
              </p>

            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-5 border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              <div>

                <label
                  htmlFor="otp"
                  className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-300"
                >
                  Verification Code
                </label>

                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      event.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  placeholder="Enter 6-digit OTP"
                  className="w-full border border-[#303030] bg-[#111111] px-4 py-3 text-center text-lg tracking-[0.5em] text-white outline-none transition focus:border-neutral-500"
                />

              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#e8e5e0] py-3 text-xs font-semibold tracking-[0.18em] text-[#171717] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "VERIFYING..."
                  : "VERIFY OTP"}
              </button>

            </form>

            {/* RESEND */}

            <div className="mt-6 text-center">

              {countdown > 0 ? (
                <p className="text-xs text-neutral-500">
                  Resend OTP in{" "}
                  <span className="text-neutral-300">
                    {countdown}s
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-xs text-neutral-400 transition hover:text-white disabled:opacity-50"
                >
                  {resendLoading
                    ? "Sending..."
                    : "Resend OTP"}
                </button>
              )}

            </div>

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

export default AdminVerifyResetOtp;