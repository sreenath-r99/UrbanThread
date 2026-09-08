import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtp, resendOtp } from "../../services/authService";

import "./VerifyOtp.css";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from Register page
  const email = location.state?.email;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [timeLeft, setTimeLeft] = useState(60);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const inputRefs = useRef([]);

  // =========================
  // OTP COUNTDOWN
  // =========================

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((previousTime) => previousTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // =========================
  // REDIRECT IF NO EMAIL
  // =========================

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  // =========================
  // FORMAT TIMER
  // =========================

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  };

  // =========================
  // OTP INPUT CHANGE
  // =========================

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];

    newOtp[index] = value.slice(-1);

    setOtp(newOtp);

    // Move automatically to next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // =========================
  // BACKSPACE
  // =========================

  const handleKeyDown = (event, index) => {
    if (
      event.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1].focus();
    }
  };

  // =========================
  // PASTE OTP
  // =========================

  const handlePaste = (event) => {
    event.preventDefault();

    const pastedData = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedData) return;

    const newOtp = [...otp];

    pastedData.split("").forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);

    const lastIndex = Math.min(
      pastedData.length - 1,
      5
    );

    inputRefs.current[lastIndex].focus();
  };

  // =========================
  // VERIFY OTP
  // =========================

  const handleVerify = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await verifyOtp({
        email,
        otp: otpCode,
      });

      console.log(response);

      setMessage("Email verified successfully!");

      // Change this route later according to your flow
      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Invalid or expired OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESEND OTP
  // =========================

  const handleResend = async () => {
    if (timeLeft > 0) return;

    setError("");
    setMessage("");

    try {
      setResending(true);

      const response = await resendOtp({
        email,
      });

      console.log(response);

      setMessage("A new OTP has been sent to your email");

      // Clear old OTP
      setOtp(["", "", "", "", "", ""]);

      // Restart timer
      setTimeLeft(60);

      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to resend OTP"
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="otp-page">

      <div className="otp-background-overlay"></div>

      {/* HEADER */}

      <header className="otp-header">
        <h1>URBANTHREAD</h1>
      </header>


      {/* OTP CARD */}

      <main className="otp-main">

        <div className="otp-card">

          <h2>Verify Your Email</h2>

          <p className="otp-description">
            Enter the 6-digit code sent to your
            <br />
            email address to continue.
          </p>


          {/* EMAIL */}

          {email && (
            <p className="otp-email">
              {email}
            </p>
          )}


          <form onSubmit={handleVerify}>

            {/* OTP INPUTS */}

            <div
              className="otp-input-container"
              onPaste={handlePaste}
            >
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
                      event.target.value,
                      index
                    )
                  }
                  onKeyDown={(event) =>
                    handleKeyDown(
                      event,
                      index
                    )
                  }
                  autoFocus={index === 0}
                />
              ))}
            </div>


            {/* TIMER */}

            <div className="otp-timer">

              {timeLeft > 0 ? (
                <p>
                  Code expires in{" "}
                  <span>
                    {formatTime()}
                  </span>
                </p>
              ) : (
                <p className="otp-expired">
                  OTP expired
                </p>
              )}

            </div>


            {/* ERROR */}

            {error && (
              <p className="otp-error">
                {error}
              </p>
            )}


            {/* SUCCESS */}

            {message && (
              <p className="otp-success">
                {message}
              </p>
            )}


            {/* CONFIRM */}

            <button
              type="submit"
              className="confirm-button"
              disabled={loading}
            >
              {loading
                ? "VERIFYING..."
                : "CONFIRM"}
            </button>

          </form>


          {/* RESEND */}

          <button
            type="button"
            className={`resend-button ${
              timeLeft > 0
                ? "disabled"
                : ""
            }`}
            onClick={handleResend}
            disabled={
              timeLeft > 0 ||
              resending
            }
          >
            {resending
              ? "Sending..."
              : timeLeft > 0
              ? `Resend OTP in ${formatTime()}`
              : "Resend OTP"}
          </button>


          {/* BACK */}

          <button
            className="back-email-button"
            onClick={() =>
              navigate("/register")
            }
          >
            ← BACK TO EMAIL
          </button>

        </div>

      </main>


      {/* FOOTER */}

      <footer className="otp-footer">
        © 2026 URBANTHREAD. ALL RIGHTS RESERVED.
      </footer>

    </div>
  );
};

export default VerifyOtp;