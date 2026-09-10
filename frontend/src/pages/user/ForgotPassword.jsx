import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { forgotPassword } from "../../services/authService";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  // ==========================
  // HANDLE SUBMIT
  // ==========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // Basic validation
    if (!email.trim()) {
      setError(
        "Please enter your email address"
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await forgotPassword(
          email.trim()
        );

      setSuccess(
        response.message ||
          "OTP sent successfully"
      );

      // Small delay for success message
      setTimeout(() => {
        navigate("/verify-reset-otp", {
          state: {
            email: email.trim(),
          },
        });
      }, 1000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center p-4">

      {/* MAIN CONTAINER */}

      <div className="
        w-full
        max-w-6xl
        min-h-[650px]
        grid
        grid-cols-1
        lg:grid-cols-2
        bg-[#171717]
        border
        border-[#292929]
        overflow-hidden
      ">


        {/* ==========================
            LEFT IMAGE SECTION
        ========================== */}

        <div
          className="
            relative
            hidden
            lg:block
            min-h-[650px]
            bg-cover
            bg-center
          "
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(10,10,10,0.20), rgba(10,10,10,0.85)), url('https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1200&q=80')",
          }}
        >

          {/* DARK OVERLAY */}

          <div className="
            absolute
            inset-0
            bg-black/20
          " />

        </div>


        {/* ==========================
            RIGHT FORM SECTION
        ========================== */}

        <div className="
          flex
          items-center
          justify-center
          p-6
          sm:p-10
          lg:p-16
        ">

          <div className="
            w-full
            max-w-md
          ">


            {/* BACK TO LOGIN */}

            <Link
              to="/login"
              className="
                inline-flex
                items-center
                gap-2
                text-sm
                text-gray-400
                hover:text-white
                transition
                mb-12
              "
            >
              ← Back to Login
            </Link>


            {/* CARD */}

            <div className="
              bg-[#202020]
              border
              border-[#303030]
              rounded-lg
              p-8
              sm:p-10
              shadow-2xl
            ">


              {/* TITLE */}

              <h1 className="
                text-3xl
                font-serif
                font-semibold
                text-center
                text-[#e7dfd3]
                mb-4
              ">
                Reset with OTP
              </h1>


              {/* DESCRIPTION */}

              <p className="
                text-sm
                text-gray-400
                text-center
                leading-relaxed
                mb-8
              ">
                Enter your email address and we'll
                send you a 6-digit one-time password
                to reset your password.
              </p>


              {/* FORM */}

              <form
                onSubmit={handleSubmit}
              >

                {/* EMAIL */}

                <div className="mb-5">

                  <label className="
                    block
                    text-xs
                    uppercase
                    tracking-wide
                    text-gray-300
                    mb-3
                  ">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="your@email.com"
                    className="
                      w-full
                      bg-[#202020]
                      border
                      border-[#3a3a3a]
                      text-white
                      px-4
                      py-3
                      rounded
                      outline-none
                      focus:border-[#cfc3b4]
                      transition
                    "
                  />

                </div>


                {/* ERROR */}

                {error && (
                  <div className="
                    mb-4
                    text-sm
                    text-red-400
                  ">
                    {error}
                  </div>
                )}


                {/* SUCCESS */}

                {success && (
                  <div className="
                    mb-4
                    text-sm
                    text-green-400
                  ">
                    {success}
                  </div>
                )}


                {/* BUTTON */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full
                    bg-[#e7dfd3]
                    text-[#222]
                    py-3
                    text-xs
                    font-semibold
                    tracking-[0.2em]
                    hover:bg-white
                    transition
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  {loading
                    ? "SENDING..."
                    : "SEND OTP"}
                </button>

              </form>


              {/* DIVIDER */}

              <div className="
                border-t
                border-[#333]
                my-8
              " />


              {/* SECURITY TEXT */}

              <p className="
                text-center
                text-xs
                text-gray-500
              ">
                🔒 Your account security is important to us.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ForgotPassword;