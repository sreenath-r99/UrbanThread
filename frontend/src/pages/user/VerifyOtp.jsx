import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtp, resendOtp } from "../../services/authService";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from Register page
  const email = location.state?.email;

  // OTP state
  const [otp, setOtp] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  // 10 minutes = 600 seconds
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

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  // =========================
  // OTP INPUT CHANGE
  // =========================

  const handleChange = (value, index) => {
    // Allow only numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];

    // Only keep the last digit
    newOtp[index] = value.slice(-1);

    setOtp(newOtp);

    // Move to next input automatically
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
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
      inputRefs.current[index - 1]?.focus();
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

    const newOtp = [
      "",
      "",
      "",
      "",
      "",
      "",
    ];

    pastedData.split("").forEach(
      (digit, index) => {
        newOtp[index] = digit;
      }
    );

    setOtp(newOtp);

    const lastIndex = Math.min(
      pastedData.length - 1,
      5
    );

    inputRefs.current[lastIndex]?.focus();
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
      setError(
        "Please enter the complete 6-digit OTP"
      );
      return;
    }

    try {
      setLoading(true);

      const response = await verifyOtp({
        email,
        otp: otpCode,
      });

      console.log(response);

      setMessage(
        "Email verified successfully!"
      );

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

      setMessage(
        "A new OTP has been sent to your email"
      );

      // Clear old OTP
      setOtp([
        "",
        "",
        "",
        "",
        "",
        "",
      ]);

      // Restart 10-minute timer
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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#171718] text-white">

      {/* BACKGROUND DESIGN */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_15%_30%,rgba(255,255,255,0.035),transparent_30%),linear-gradient(120deg,transparent_40%,rgba(255,255,255,0.03)_41%,transparent_42%)]
        "
      />

      {/* HEADER */}

      <header
        className="
          relative
          z-10
          flex
          h-[90px]
          items-center
          justify-center
        "
      >
        <h1
          className="
            font-serif
            text-[22px]
            font-semibold
            tracking-[3px]
            text-[#e4e0da]
          "
        >
          URBANTHREAD
        </h1>
      </header>


      {/* MAIN */}

      <main
        className="
          relative
          z-10
          flex
          flex-1
          items-center
          justify-center
          px-4
          pb-[70px]
        "
      >

        {/* OTP CARD */}

        <div
          className="
            w-full
            max-w-[390px]
            border
            border-[#29292b]
            bg-[#1d1d1e]
            px-[35px]
            pb-[35px]
            pt-[45px]
            text-center
            shadow-[0_20px_60px_rgba(0,0,0,0.35)]
            sm:min-h-[410px]
          "
        >

          {/* TITLE */}

          <h2
            className="
              mb-4
              font-serif
              text-[22px]
              text-[#dedad4]
            "
          >
            Verify Your Email
          </h2>


          {/* DESCRIPTION */}

          <p
            className="
              mb-[10px]
              text-[13px]
              leading-[1.7]
              text-[#a3a3a5]
            "
          >
            Enter the 6-digit code sent to your
            <br />
            email address to continue.
          </p>


          {/* EMAIL */}

          {email && (
            <p
              className="
                mb-[25px]
                break-all
                text-[12px]
                text-[#d4cfc7]
              "
            >
              {email}
            </p>
          )}


          <form onSubmit={handleVerify}>

            {/* OTP INPUTS */}

            <div
              className="
                my-[25px]
                mb-[10px]
                flex
                justify-center
                gap-[7px]
                sm:gap-[10px]
              "
              onPaste={handlePaste}
            >

              {otp.map((digit, index) => (

                <input
                  key={index}

                  ref={(element) => {
                    inputRefs.current[index] =
                      element;
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

                  className="
                    h-[42px]
                    w-[38px]
                    border
                    border-[#333335]
                    bg-[#171718]
                    text-center
                    text-[18px]
                    text-white
                    outline-none
                    transition
                    focus:border-[#a99c8c]
                    focus:ring-1
                    focus:ring-[#a99c8c]/35
                  "
                />

              ))}

            </div>


            {/* TIMER */}

            <div
              className="
                mb-[15px]
                min-h-[28px]
              "
            >

              {timeLeft > 0 ? (

                <p
                  className="
                    text-[12px]
                    text-[#89898b]
                  "
                >
                  Code expires in{" "}

                  <span
                    className="
                      ml-1
                      font-semibold
                      text-[#d8d0c5]
                    "
                  >
                    {formatTime()}
                  </span>

                </p>

              ) : (

                <p
                  className="
                    text-[12px]
                    text-[#d58c8c]
                  "
                >
                  OTP expired
                </p>

              )}

            </div>


            {/* ERROR */}

            {error && (

              <p
                className="
                  mb-[15px]
                  text-[12px]
                  text-[#e78181]
                "
              >
                {error}
              </p>

            )}


            {/* SUCCESS */}

            {message && (

              <p
                className="
                  mb-[15px]
                  text-[12px]
                  text-[#85bd8a]
                "
              >
                {message}
              </p>

            )}


            {/* CONFIRM BUTTON */}

            <button
              type="submit"

              disabled={loading}

              className="
                h-[48px]
                w-full
                border-none
                bg-[#e5ded4]
                text-[12px]
                font-bold
                tracking-[1px]
                text-[#343230]
                transition
                hover:bg-[#f0e8dd]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >

              {loading
                ? "VERIFYING..."
                : "CONFIRM"}

            </button>

          </form>


          {/* RESEND OTP */}

          <button
            type="button"

            onClick={handleResend}

            disabled={
              timeLeft > 0 ||
              resending
            }

            className="
              mt-5
              bg-transparent
              text-[12px]
              tracking-[0.4px]
              text-[#d7d0c7]
              transition
              hover:text-white
              disabled:cursor-not-allowed
              disabled:text-[#5f5f61]
            "
          >

            {resending
              ? "Sending..."
              : timeLeft > 0
              ? `Resend OTP in ${formatTime()}`
              : "Resend OTP"}

          </button>


          {/* BACK BUTTON */}

          <button
            type="button"

            onClick={() =>
              navigate("/register")
            }

            className="
              mt-[22px]
              block
              w-full
              bg-transparent
              text-[11px]
              tracking-[0.5px]
              text-[#a5a3a0]
              transition
              hover:text-white
            "
          >
            ← BACK TO EMAIL
          </button>

        </div>

      </main>


      {/* FOOTER */}

      <footer
        className="
          relative
          z-10
          flex
          h-[55px]
          items-center
          justify-center
          border-t
          border-[#29292b]
          text-[10px]
          font-semibold
          tracking-[1.2px]
          text-[#777779]
        "
      >
        © 2026 URBANTHREAD. ALL RIGHTS RESERVED.
      </footer>

    </div>
  );
};

export default VerifyOtp;