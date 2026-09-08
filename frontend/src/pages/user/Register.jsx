import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

import { registerUser } from "../../services/authService";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [agree, setAgree] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!agree) {
      setError("Please accept Terms and Conditions");
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
    <div className="register-page">

      {/* LEFT SECTION */}

      <div className="register-image-section">

        <div className="brand-top">
          UrbanThread
        </div>

        <div className="brand-content">
          <h1>UrbanThread</h1>

          <h3>Wear Your Style.</h3>

          <p>
            Create your account and discover shirts designed
            to match your style.
          </p>
        </div>

      </div>


      {/* RIGHT SECTION */}

      <div className="register-form-section">

        <div className="register-container">

          <div className="register-header">

            <div>
              <h2>Create Your Account</h2>

              <p>
                Join UrbanThread and start exploring your style.
              </p>
            </div>

            <Link
              to="/login"
              className="back-login"
            >
              ← Back to Login
            </Link>

          </div>


          <form onSubmit={handleSubmit}>

            {/* NAME */}

            <div className="form-group">

              <label>
                Full Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />

            </div>


            {/* EMAIL */}

            <div className="form-group">

              <label>
                Email Address
              </label>

              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
              />

            </div>


            {/* PASSWORD */}

            <div className="form-group">

              <label>
                Password
              </label>

              <div className="password-input">

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
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  👁
                </button>

              </div>

              <small>
                Must be at least 8 characters.
              </small>

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="form-group">

              <label>
                Confirm Password
              </label>

              <div className="password-input">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  👁
                </button>

              </div>

            </div>


            {/* TERMS */}

            <div className="terms">

              <input
                type="checkbox"
                checked={agree}
                onChange={(e) =>
                  setAgree(e.target.checked)
                }
              />

              <span>
                I agree to the Terms and Conditions and
                Privacy Policy
              </span>

            </div>


            {/* ERROR */}

            {error && (
              <p className="error-message">
                {error}
              </p>
            )}


            {/* REGISTER */}

            <button
              type="submit"
              className="create-account-btn"
              disabled={loading}
            >

              {loading
                ? "Creating Account..."
                : "Create Account"}

            </button>


            {/* DIVIDER */}

            <div className="divider">

              <span></span>

              <p>OR</p>

              <span></span>

            </div>


            {/* GOOGLE */}

            <button
              type="button"
              className="google-btn"
            >

              <span className="google-icon">
                G
              </span>

              Continue with Google

            </button>


            {/* LOGIN */}

            <p className="login-text">

              Already have an account?

              <Link to="/login">
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