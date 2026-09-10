import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

import useAuth from "../../hooks/useAuth";
import { loginSchema } from "../../validations/authValidation";

import loginModel from "../../assets/register-model.jpg";

const Login = () => {
  const navigate = useNavigate();

  const { login, googleLogin } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [errors, setErrors] = useState({});

  const [loading, setLoading] =
    useState(false);

  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [serverError, setServerError] =
    useState("");

  // =========================
  // HANDLE INPUT CHANGE
  // =========================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    // Remove field error
    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));

    setServerError("");
  };

  // =========================
  // HANDLE NORMAL LOGIN
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrors({});
    setServerError("");

    // Zod validation
    const validationResult =
      loginSchema.safeParse(formData);

    if (!validationResult.success) {
      const fieldErrors = {};

      validationResult.error.issues.forEach(
        (issue) => {
          const fieldName = issue.path[0];

          if (!fieldErrors[fieldName]) {
            fieldErrors[fieldName] =
              issue.message;
          }
        }
      );

      setErrors(fieldErrors);

      return;
    }

    try {
      setLoading(true);

      const response = await login(
        validationResult.data
      );

      console.log(
        "Normal login successful:",
        response
      );

      navigate("/");
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      setServerError(
        error.response?.data?.message ||
          error.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GOOGLE LOGIN SUCCESS
  // =========================

  const handleGoogleSuccess = async (
    credentialResponse
  ) => {
    try {
      setGoogleLoading(true);
      setServerError("");

      // Check Google credential
      if (!credentialResponse?.credential) {
        throw new Error(
          "Google authentication failed"
        );
      }

      console.log(
        "Google credential received successfully"
      );

      // Send Google credential to backend
      const response = await axios.post(
        "http://localhost:5000/api/auth/google",
        {
          credential:
            credentialResponse.credential,
        }
      );

      console.log(
        "Google backend response:",
        response.data
      );

      // Check backend response
      if (
        !response.data.success ||
        !response.data.token ||
        !response.data.user
      ) {
        throw new Error(
          response.data.message ||
            "Google authentication failed"
        );
      }

      // =========================
      // SAVE AUTH DATA
      // =========================

      googleLogin({
  token: response.data.token,
  user: response.data.user,
});

      console.log(
        "Google login successful"
      );

      // Redirect to home
      navigate("/");
    } catch (error) {
      console.error(
        "GOOGLE LOGIN ERROR:",
        error
      );

      setServerError(
        error.response?.data?.message ||
          error.message ||
          "Google login failed. Please try again."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  // =========================
  // GOOGLE LOGIN ERROR
  // =========================

  const handleGoogleError = () => {
    setGoogleLoading(false);

    setServerError(
      "Google login failed. Please try again."
    );
  };

  return (
    <div className="min-h-screen bg-[#181818] text-white">
      <div className="flex min-h-screen">

        {/* =========================
            LEFT IMAGE SECTION
        ========================= */}

        <section
          className="
            relative
            hidden
            min-h-screen
            w-[60%]
            overflow-hidden
            lg:block
          "
        >
          {/* BACKGROUND IMAGE */}

          <img
            src={loginModel}
            alt="UrbanThread fashion"
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
              object-center
            "
          />

          {/* DARK OVERLAY */}

          <div
            className="
              absolute
              inset-0
              bg-black/45
            "
          />

          {/* BRAND CONTENT */}

          <div
            className="
              absolute
              bottom-10
              left-10
              z-10
            "
          >
            <h1
              className="
                mb-8
                font-serif
                text-5xl
                font-semibold
                tracking-tight
                text-[#e6dfd5]
                xl:text-6xl
              "
            >
              UrbanThread
            </h1>

            <h2
              className="
                font-serif
                text-2xl
                font-semibold
                text-[#e6dfd5]
                xl:text-3xl
              "
            >
              Wear Your Style.
            </h2>
          </div>
        </section>

        {/* =========================
            RIGHT LOGIN SECTION
        ========================= */}

        <section
          className="
            flex
            min-h-screen
            w-full
            items-center
            justify-center
            bg-[#181818]
            px-8
            lg:w-[40%]
            lg:px-10
          "
        >
          <div
            className="
              w-full
              max-w-[360px]
            "
          >
            {/* LOGIN HEADER */}

            <div className="mb-8">
              <h2
                className="
                  mb-2
                  font-serif
                  text-2xl
                  font-semibold
                  text-[#e6dfd5]
                "
              >
                Welcome
              </h2>

              <p
                className="
                  text-xs
                  text-neutral-400
                "
              >
                Sign in to continue your
                UrbanThread experience.
              </p>
            </div>

            {/* =========================
                LOGIN FORM
            ========================= */}

            <form onSubmit={handleSubmit}>

              {/* EMAIL */}

              <div className="mb-5">
                <label
                  htmlFor="email"
                  className="
                    mb-2
                    block
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wider
                    text-neutral-300
                  "
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`
                    w-full
                    border
                    bg-[#1d1d1d]
                    px-4
                    py-3
                    text-xs
                    text-white
                    outline-none
                    placeholder:text-neutral-600
                    transition
                    focus:border-[#cfc4b5]

                    ${
                      errors.email
                        ? "border-red-500"
                        : "border-[#303030]"
                    }
                  `}
                />

                {errors.email && (
                  <p
                    className="
                      mt-2
                      text-xs
                      text-red-400
                    "
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              {/* PASSWORD */}

              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="
                    mb-2
                    block
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wider
                    text-neutral-300
                  "
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`
                      w-full
                      border
                      bg-[#1d1d1d]
                      px-4
                      py-3
                      pr-12
                      text-xs
                      text-white
                      outline-none
                      placeholder:text-neutral-600
                      transition
                      focus:border-[#cfc4b5]

                      ${
                        errors.password
                          ? "border-red-500"
                          : "border-[#303030]"
                      }
                    `}
                  />

                  {/* SHOW PASSWORD */}

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previousValue) =>
                          !previousValue
                      )
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-sm
                      text-neutral-500
                      transition
                      hover:text-white
                    "
                    aria-label="Toggle password visibility"
                  >
                    {showPassword
                      ? "◉"
                      : "◉̸"}
                  </button>
                </div>

                {errors.password && (
                  <p
                    className="
                      mt-2
                      text-xs
                      text-red-400
                    "
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              {/* FORGOT PASSWORD */}

              <div className="mb-5">
                <Link
                  to="/forgot-password"
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-neutral-400
                    transition
                    hover:text-white
                  "
                >
                  Forgot Password?
                </Link>
              </div>

              {/* SERVER ERROR */}

              {serverError && (
                <p
                  className="
                    mb-4
                    text-xs
                    text-red-400
                  "
                >
                  {serverError}
                </p>
              )}

              {/* SIGN IN BUTTON */}

              <button
                type="submit"
                disabled={
                  loading ||
                  googleLoading
                }
                className="
                  w-full
                  bg-[#e3dbd0]
                  py-3
                  text-[10px]
                  font-semibold
                  tracking-[0.2em]
                  text-[#2a2825]
                  transition
                  hover:bg-[#f0e8dd]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading
                  ? "SIGNING IN..."
                  : "SIGN IN"}
              </button>

              {/* DIVIDER */}

              <div
                className="
                  my-6
                  flex
                  items-center
                  gap-4
                "
              >
                <div
                  className="
                    h-px
                    flex-1
                    bg-[#303030]
                  "
                />

                <span
                  className="
                    text-[9px]
                    text-neutral-500
                  "
                >
                  OR
                </span>

                <div
                  className="
                    h-px
                    flex-1
                    bg-[#303030]
                  "
                />
              </div>

              {/* =========================
                  GOOGLE LOGIN
              ========================= */}

              <div
                className="
                  mb-7
                  flex
                  justify-center
                "
              >
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                  width="360"
                />
              </div>

              {googleLoading && (
                <p
                  className="
                    mb-4
                    text-center
                    text-xs
                    text-neutral-400
                  "
                >
                  Signing in with Google...
                </p>
              )}

              {/* REGISTER */}

              <p
                className="
                  text-center
                  text-xs
                  text-neutral-500
                "
              >
                Don't have an account?

                <Link
                  to="/register"
                  className="
                    ml-1
                    font-medium
                    uppercase
                    tracking-wide
                    text-neutral-300
                    transition
                    hover:text-white
                  "
                >
                  Create an Account
                </Link>
              </p>

            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;