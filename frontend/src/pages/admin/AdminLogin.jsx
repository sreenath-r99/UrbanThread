import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AdminAuthContext } from "../../context/AdminAuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();

  const { adminLogin } = useContext(AdminAuthContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ==========================
  // INPUT CHANGE
  // ==========================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));

    setServerError("");
  };

  // ==========================
  // VALIDATION
  // ==========================

  const validateForm = () => {
    const newErrors = {};

    const email = formData.email.trim();
    const password = formData.password;

    if (!email) {
      newErrors.email = "Admin email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ==========================
  // FORM SUBMIT
  // ==========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setServerError("");

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await adminLogin({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      console.log("Admin login successful:", response);

      navigate("/admin/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("Admin login failed:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Admin login failed";

      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ==========================
            LEFT IMAGE SECTION
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
            RIGHT LOGIN SECTION
        ========================== */}

        <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
          {/* Decorative dots */}

          <div className="absolute right-8 top-8 flex gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-700" />
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-700" />
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-700" />
          </div>

          <div className="w-full max-w-md">
            <div className="border border-[#292929] bg-[#1b1b1b] px-7 py-8 shadow-2xl sm:px-10 sm:py-10">
              {/* Portal badge */}

              <div className="mb-7 flex justify-center">
                <span className="rounded-full border border-[#353535] px-4 py-1 text-[10px] font-medium tracking-[0.2em] text-neutral-400">
                  ADMIN PORTAL
                </span>
              </div>

              {/* Heading */}

              <div className="mb-8 text-center">
                <h2 className="font-serif text-3xl text-white">
                  Welcome
                </h2>

                <p className="mt-3 text-sm text-neutral-400">
                  Sign in to your UrbanThread admin account
                </p>
              </div>

              {/* Server error */}

              {serverError && (
                <div className="mb-5 border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                  {serverError}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Email */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-300"
                  >
                    Email Address
                  </label>

                  <div className="flex items-center border border-[#303030] bg-[#1b1b1b] transition focus-within:border-neutral-500">
                    <span className="pl-3 text-neutral-500">
                      ✉
                    </span>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your admin email"
                      autoComplete="email"
                      className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-neutral-600"
                    />
                  </div>

                  {errors.email && (
                    <p className="mt-2 text-xs text-red-400">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-300"
                  >
                    Password
                  </label>

                  <div className="flex items-center border border-[#303030] bg-[#1b1b1b] transition focus-within:border-neutral-500">
                    <span className="pl-3 text-neutral-500">
                      🔒
                    </span>

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-neutral-600"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previousValue) => !previousValue
                        )
                      }
                      className="mr-3 text-neutral-500 transition hover:text-white"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? "◉" : "◌"}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="mt-2 text-xs text-red-400">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Forgot password */}

                <div className="text-center">
                  <Link
                    to="/admin/forgot-password"
                    className="text-xs text-neutral-400 transition hover:text-white"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit button */}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#e8e5e0] py-3 text-xs font-semibold tracking-[0.18em] text-[#171717] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "SIGNING IN..." : "SIGN IN"}
                </button>

                {/* Secure access */}

                <div className="flex items-center justify-center gap-2 pt-1 text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                  <span>🔒</span>
                  <span>Secure Admin Access</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;