import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { changePassword } from "../../services/authService";

const ChangePassword = () => {
  const navigate = useNavigate();

  const { token, logout } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const togglePasswordVisibility = (fieldName) => {
    setShowPasswords((previousState) => ({
      ...previousState,
      [fieldName]: !previousState[fieldName],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword =
        "Current password is required";
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword =
        "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword =
        "New password must be at least 6 characters";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword =
        "Please confirm your new password";
    } else if (
      formData.newPassword !== formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    if (
      formData.currentPassword &&
      formData.newPassword &&
      formData.currentPassword === formData.newPassword
    ) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setServerError("");

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      await changePassword(
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        token
      );

      alert(
        "Password changed successfully. Please login again."
      );

      logout();

      navigate("/login", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to change password";

      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderEyeIcon = (fieldName) => {
    const isVisible = showPasswords[fieldName];

    return (
      <button
        type="button"
        onClick={() =>
          togglePasswordVisibility(fieldName)
        }
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
        aria-label={
          isVisible
            ? "Hide password"
            : "Show password"
        }
      >
        {isVisible ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-5 w-5"
          >
            <path d="M3 3l18 18" />
            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
            <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.5 0 9 7 9 7a17.8 17.8 0 0 1-3.1 4.2" />
            <path d="M6.2 6.2C3.9 8.1 3 12 3 12s3.5 7 9 7a9.8 9.8 0 0 0 3.2-.5" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-5 w-5"
          >
            <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
            <circle
              cx="12"
              cy="12"
              r="2.5"
            />
          </svg>
        )}
      </button>
    );
  };

  const renderPasswordField = ({
    id,
    label,
    placeholder,
  }) => {
    const isVisible = showPasswords[id];

    return (
      <div>
        <label
          htmlFor={id}
          className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#d8d1c8]"
        >
          {label}
        </label>

        <div className="relative mt-3">
          <input
            id={id}
            name={id}
            type={isVisible ? "text" : "password"}
            value={formData[id]}
            onChange={handleChange}
            placeholder={placeholder}
            className="h-12 w-full border border-[#d4d4d4] bg-[#f8f8f8] px-4 pr-12 text-sm text-[#222222] outline-none transition placeholder:text-[#d8d8d8] focus:border-[#b9a995]"
          />

          {renderEyeIcon(id)}
        </div>

        {errors[id] && (
          <p className="mt-2 text-xs text-red-400">
            {errors[id]}
          </p>
        )}
      </div>
    );
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center px-5 py-10"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=2200&q=85')",
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/75" />

      {/* Password card */}
      <div className="relative z-10 w-full max-w-[385px] rounded-md border border-[#363636] bg-[#171717]/95 px-8 py-10 shadow-2xl sm:px-9">
        {/* Brand */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="font-serif text-[15px] text-[#e7ded3] transition hover:text-white"
          >
            UrbanThread
          </button>

          <h1 className="mt-8 font-serif text-[25px] text-[#e8e0d7]">
            Create a New Password
          </h1>

          <p className="mx-auto mt-3 max-w-[275px] text-sm leading-5 text-[#b8b1aa]">
            Choose a strong password for your
            UrbanThread account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          {renderPasswordField({
            id: "currentPassword",
            label: "Current Password",
            placeholder: "Enter current password",
          })}

          {renderPasswordField({
            id: "newPassword",
            label: "New Password",
            placeholder: "Enter new password",
          })}

          {renderPasswordField({
            id: "confirmPassword",
            label: "Confirm Password",
            placeholder: "Confirm new password",
          })}

          {serverError && (
            <div className="border border-red-900 bg-red-950/40 px-4 py-3 text-xs leading-5 text-red-400">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-3 h-12 w-full bg-[#e9dfd3] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#282522] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Updating Password..."
              : "Reset Password"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/profile/edit")}
            className="block w-full pt-2 text-center text-[10px] uppercase tracking-[0.14em] text-gray-500 transition hover:text-white"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;