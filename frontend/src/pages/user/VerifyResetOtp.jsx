import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { forgotPassword } from "../../services/authService";

const VerifyResetOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const inputRefs = useRef([]);

  // Redirect if email is missing
  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  // OTP resend timer
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((previousTimer) => previousTimer - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const updatedOtp = [...otp];

    updatedOtp[index] = value;

    setOtp(updatedOtp);

    setError("");

    // Automatically move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (
      event.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = (event) => {
    event.preventDefault();

    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    /*
      IMPORTANT:

      Your current backend verifies the reset OTP
      inside /auth/reset-password.

      So here we move to Create New Password
      while carrying email + OTP.

      The backend will AUTHORITATIVELY verify
      the OTP before resetting the password.
    */

    navigate("/create-new-password", {
      state: {
        email,
        otp: enteredOtp,
      },
    });
  };

  const handleResendOtp = async () => {
    if (timer > 0 || loading) return;

    try {
      setLoading(true);
      setError("");
      setMessage("");

      await forgotPassword(email);

      setMessage("A new OTP has been sent.");

      setOtp([
        "",
        "",
        "",
        "",
        "",
        "",
      ]);

      setTimer(30);

      inputRefs.current[0]?.focus();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to resend OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatEmail = () => {
    if (!email) return "your email";

    const [username, domain] = email.split("@");

    if (!domain) return email;

    const hiddenUsername =
      username.length > 2
        ? `${username.slice(0, 1)}***`
        : username;

    return `${hiddenUsername}@${domain}`;
  };

  return (
    <div className="min-h-screen bg-[#151516] text-white flex flex-col">
      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        {/* BRAND */}
        <h1 className="mb-8 text-sm md:text-base tracking-[0.3em] font-serif font-semibold text-[#e7e0d7]">
          URBANTHREAD
        </h1>

        {/* CARD */}
        <div className="w-full max-w-md bg-[#1c1c1e] border border-[#303034] rounded-lg px-7 py-8 md:px-10 md:py-9 shadow-2xl">
          {/* TITLE */}
          <h2 className="text-center text-2xl md:text-3xl font-serif font-semibold text-[#ded8d1]">
            Verify Your Email
          </h2>

          {/* DESCRIPTION */}
          <p className="mt-4 text-center text-sm leading-6 text-gray-400">
            Enter the 6-digit code sent to
            <br />
            <span className="text-gray-300">
              {formatEmail()}
            </span>
            <br />
            to continue resetting your password.
          </p>

          {/* ERROR */}
          {error && (
            <div className="mt-5 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
              {error}
            </div>
          )}

          {/* SUCCESS MESSAGE */}
          {message && (
            <div className="mt-5 rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-center text-sm text-green-400">
              {message}
            </div>
          )}

          {/* FORM */}
          <form
            onSubmit={handleVerifyOtp}
            className="mt-7"
          >
            {/* OTP INPUTS */}
            <div className="flex justify-center gap-2 md:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(event) =>
                    handleChange(
                      index,
                      event.target.value
                    )
                  }
                  onKeyDown={(event) =>
                    handleKeyDown(index, event)
                  }
                  className="h-11 w-10 md:h-12 md:w-12 rounded-sm border border-[#343438] bg-[#29292b] text-center text-lg font-semibold text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              ))}
            </div>

            {/* VERIFY BUTTON */}
            <button
              type="submit"
              className="mt-7 w-full rounded-sm bg-[#d9d5d0] py-3 text-xs font-bold tracking-[0.15em] text-[#252525] transition hover:bg-white"
            >
              VERIFY OTP
            </button>
          </form>

          {/* RESEND */}
          <div className="mt-6 text-center text-sm text-gray-400">
            {timer > 0 ? (
              <>
                Didn't receive the code?{" "}
                <span className="font-semibold text-gray-300">
                  Resend OTP in {timer}s
                </span>
              </>
            ) : (
              <>
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="font-semibold text-[#ded8d1] underline underline-offset-4 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Sending..."
                    : "Resend OTP"}
                </button>
              </>
            )}
          </div>

          {/* CHANGE EMAIL */}
          <div className="mt-5 text-center text-sm text-gray-400">
            Wrong email address?{" "}
            <Link
              to="/forgot-password"
              className="font-semibold text-[#ded8d1] underline underline-offset-4 hover:text-white"
            >
              Change Email
            </Link>
          </div>
        </div>

        {/* SECURITY TEXT */}
        <div className="mt-10 flex items-center gap-2 text-xs text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 11c1.657 0 3-1.343 3-3V6a3 3 0 00-6 0v2c0 1.657 1.343 3 3 3z"
            />

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M5 11h14v9H5z"
            />
          </svg>

          <span>
            Secure Verification: For your security,
            this code expires after a limited time.
          </span>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#29292b] py-5 text-center text-xs tracking-wide text-gray-500">
        © 2026 URBANTHREAD. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
};

export default VerifyResetOtp;