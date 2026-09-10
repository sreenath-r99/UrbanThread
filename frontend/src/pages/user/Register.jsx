import registerModel from "../../assets/register-model.jpg";
import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { registerUser } from "../../services/authService";

import { registerSchema } from "../../validations/authValidation";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

  const [agree, setAgree] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

    const [errors, setErrors] = useState({});

  const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData({
    ...formData,
    [name]: value,
  });

  // Remove error for this field while typing
  if (errors[name]) {
    setErrors({
      ...errors,
      [name]: "",
    });
  }
};


const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");
  setErrors({});

  const validationResult = registerSchema.safeParse({
    ...formData,
    agree,
  });

  if (!validationResult.success) {
    const fieldErrors = {};

    validationResult.error.issues.forEach((issue) => {
      const fieldName = issue.path[0];

      if (fieldName && !fieldErrors[fieldName]) {
        fieldErrors[fieldName] = issue.message;
      }
    });

    setErrors(fieldErrors);

    return;
  }

  try {
    setLoading(true);

    const response = await registerUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    console.log(response);

    navigate("/verify-otp", {
      state: {
        email: formData.email,
      },
    });
  } catch (error) {
    console.error(error);

    setError(
      error.response?.data?.message ||
        "Registration failed"
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex min-h-screen bg-[#151515] text-white">

      {/* LEFT SECTION */}

      <div
  className="
    relative
    hidden
    min-h-screen
    w-1/2
    bg-cover
    bg-center
    lg:block
  "
  style={{
    backgroundImage: `url(${registerModel})`,
  }}
>

        {/* Overlay */}

        <div className="absolute inset-0 bg-linear-to-b from-black/35 to-black/70" />


        {/* BRAND */}

        <div className="absolute left-14 top-11 font-serif text-2xl font-semibold">

          UrbanThread

        </div>


        {/* CONTENT */}

        <div className="absolute bottom-[70px] left-14 max-w-[450px]">

          <h1 className="mb-5 font-serif text-6xl">

            UrbanThread

          </h1>

          <h3 className="mb-5 text-lg font-medium">

            Wear Your Style.

          </h3>

          <p className="text-[15px] leading-7 text-neutral-300">

            Create your account and discover shirts
            designed to match your style.

          </p>

        </div>

      </div>


      {/* RIGHT SECTION */}

      <div
        className="
          flex
          min-h-screen
          w-full
          items-center
          justify-center
          bg-[#171717]
          p-6
          md:p-10
          lg:w-1/2
        "
      >

        <div className="w-full max-w-[430px]">


          {/* HEADER */}

          <div className="mb-9 flex items-start justify-between gap-4">

            <div>

              <h2 className="mb-2 font-serif text-3xl">

                Create Your Account

              </h2>

              <p className="text-sm text-neutral-500">

                Join UrbanThread and start exploring
                your style.

              </p>

            </div>


            <Link
              to="/login"
              className="
                whitespace-nowrap
                rounded-lg
                border
                border-neutral-700
                px-3
                py-2
                text-xs
                text-neutral-300
                transition
                hover:bg-neutral-800
              "
            >

              ← Back to Login

            </Link>

          </div>


          <form onSubmit={handleSubmit}>


            {/* NAME */}

            <div className="mb-5">

              <label className="mb-2 block text-sm text-neutral-300">

                Full Name

              </label>

              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="
                  w-full
                  border
                  border-[#252525]
                  bg-[#252525]
                  px-4
                  py-3.5
                  text-sm
                  text-white
                  outline-none
                  transition
                  placeholder:text-neutral-500
                  focus:border-[#c9bba8]
                "
              />
                {errors.name && (
    <p className="mt-1 text-xs text-red-400">
      {errors.name}
    </p>
  )}

            </div>


            {/* EMAIL */}

            <div className="mb-5">

              <label className="mb-2 block text-sm text-neutral-300">

                Email Address

              </label>

              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                className="
                  w-full
                  border
                  border-[#252525]
                  bg-[#252525]
                  px-4
                  py-3.5
                  text-sm
                  text-white
                  outline-none
                  transition
                  placeholder:text-neutral-500
                  focus:border-[#c9bba8]
                "
              />
                {errors.email && (
    <p className="mt-1 text-xs text-red-400">
      {errors.email}
    </p>
  )}

            </div>


            {/* PASSWORD */}

            <div className="mb-5">

              <label className="mb-2 block text-sm text-neutral-300">

                Password

              </label>

              <div className="relative">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="
                    w-full
                    border
                    border-[#252525]
                    bg-[#252525]
                    px-4
                    py-3.5
                    pr-12
                    text-sm
                    text-white
                    outline-none
                    transition
                    focus:border-[#c9bba8]
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    cursor-pointer
                    bg-transparent
                    text-neutral-400
                  "
                >

                  👁

                </button>


              </div>
              
                {errors.password && (
    <p className="mt-1 text-xs text-red-400">
      {errors.password}
    </p>
  )}


              <small className="mt-2 block text-xs text-neutral-500">

                Must be at least 8 characters.

              </small>

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="mb-5">

              <label className="mb-2 block text-sm text-neutral-300">

                Confirm Password

              </label>

              <div className="relative">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  className="
                    w-full
                    border
                    border-[#252525]
                    bg-[#252525]
                    px-4
                    py-3.5
                    pr-12
                    text-sm
                    text-white
                    outline-none
                    transition
                    focus:border-[#c9bba8]
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    cursor-pointer
                    bg-transparent
                    text-neutral-400
                  "
                >

                  👁

                </button>

              </div>
                {errors.confirmPassword && (
    <p className="mt-1 text-xs text-red-400">
      {errors.confirmPassword}
    </p>
  )}

            </div>


            {/* TERMS */}

            <div className="mb-5 flex items-center gap-2.5 text-sm text-neutral-400">

              <input
                type="checkbox"
                checked={agree}
                onChange={(e) =>
                  setAgree(e.target.checked)
                }
                className="h-4 w-4"
              />

              <span>

                I agree to the Terms and Conditions
                and Privacy Policy

              </span>

            </div>


            {/* ERROR */}

            {error && (

              <p className="mb-4 text-sm text-red-400">

                {error}

              </p>

            )}


            {/* REGISTER BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="
                mb-6
                w-full
                cursor-pointer
                bg-[#e6ded2]
                px-4
                py-4
                font-semibold
                text-[#222]
                transition
                hover:opacity-90
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >

              {loading
                ? "Creating Account..."
                : "Create Account"}

            </button>


            {/* DIVIDER */}

            <div className="mb-6 flex items-center gap-4">

              <span className="h-px flex-1 bg-neutral-700" />

              <span className="text-xs text-neutral-500">

                OR

              </span>

              <span className="h-px flex-1 bg-neutral-700" />

            </div>


            {/* GOOGLE */}

            <button
              type="button"
              className="
                w-full
                cursor-pointer
                border
                border-neutral-700
                bg-transparent
                px-4
                py-4
                text-sm
                text-neutral-300
                transition
                hover:bg-neutral-800
              "
            >

              <span className="mr-3 font-bold text-red-500">

                G

              </span>

              Continue with Google

            </button>


            {/* LOGIN */}

            <p className="mt-9 text-center text-sm text-neutral-500">

              Already have an account?

              <Link
                to="/login"
                className="ml-1 text-neutral-300"
              >

                Sign In

              </Link>

            </p>

          </form>

        </div>

      </div>

    </div>
  );
};


export default Register;