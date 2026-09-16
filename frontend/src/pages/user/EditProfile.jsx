import { useContext, useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";
import { updateProfile } from "../../services/authService";

const EditProfile = () => {
  const {
    user,
    token,
    setUser,
    logout,
  } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });

      setPreviewImage(
        user.profileImage || user.googleImage || ""
      );
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (previewImage?.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const getInitials = () => {
    if (!user?.name) {
      return "U";
    }

    return user.name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const menuItems = [
    {
      label: "Overview",
      path: "/profile",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-5 w-5"
        >
          <rect
            x="4"
            y="4"
            width="6"
            height="6"
            rx="1"
          />
          <rect
            x="14"
            y="4"
            width="6"
            height="6"
            rx="1"
          />
          <rect
            x="4"
            y="14"
            width="6"
            height="6"
            rx="1"
          />
          <rect
            x="14"
            y="14"
            width="6"
            height="6"
            rx="1"
          />
        </svg>
      ),
    },
    {
      label: "Personal Info",
      path: "/profile/edit",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-5 w-5"
        >
          <circle
            cx="12"
            cy="8"
            r="3.5"
          />
          <path d="M5 20c.8-3.3 3.2-5 7-5s6.2 1.7 7 5" />
        </svg>
      ),
    },
    {
      label: "Orders",
      path: "/orders",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-5 w-5"
        >
          <path d="M6 4h12l2 4v12H4V8l2-4Z" />
          <path d="M4 8h16" />
          <path d="M9 12h6" />
        </svg>
      ),
    },
    {
      label: "Wishlist",
      path: "/wishlist",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-5 w-5"
        >
          <path d="M20.8 8.8c0 5.5-8.8 10.2-8.8 10.2S3.2 14.3 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />
        </svg>
      ),
    },
    {
      label: "Addresses",
      path: "/addresses",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-5 w-5"
        >
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle
            cx="12"
            cy="10"
            r="2.5"
          />
        </svg>
      ),
    },
    {
      label: "Coupons",
      path: "/coupons",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-5 w-5"
        >
          <path d="M20 12a2 2 0 0 0 0-4V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v3a2 2 0 0 0 0 4v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3Z" />
          <path d="M12 7v2" />
          <path d="M12 15v2" />
        </svg>
      ),
    },
  ];

  const validateForm = () => {
    const newErrors = {};

    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone.trim();

    if (!trimmedName) {
      newErrors.name = "Full name is required";
    } else if (trimmedName.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (trimmedName.length > 50) {
      newErrors.name = "Name must not exceed 50 characters";
    }

    if (
      trimmedPhone &&
      !/^[0-9+\-\s()]{7,20}$/.test(trimmedPhone)
    ) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (profileImage) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(profileImage.type)) {
        newErrors.profileImage =
          "Only JPG, PNG, and WEBP images are allowed";
      }

      if (profileImage.size > 2 * 1024 * 1024) {
        newErrors.profileImage =
          "Profile image must not exceed 2MB";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

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
    setSuccessMessage("");
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setProfileImage(null);
      setErrors((previousErrors) => ({
        ...previousErrors,
        profileImage:
          "Only JPG, PNG, and WEBP images are allowed",
      }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setProfileImage(null);
      setErrors((previousErrors) => ({
        ...previousErrors,
        profileImage:
          "Profile image must not exceed 2MB",
      }));
      return;
    }

    setProfileImage(file);
    setPreviewImage(URL.createObjectURL(file));

    setErrors((previousErrors) => ({
      ...previousErrors,
      profileImage: "",
    }));

    setServerError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSuccessMessage("");
    setServerError("");

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const formDataToSend = new FormData();

      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("phone", formData.phone.trim());

      if (profileImage) {
        formDataToSend.append("profileImage", profileImage);
      }

      const response = await updateProfile(
        formDataToSend,
        token
      );

      setUser(response.user);

      localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );

      setProfileImage(null);

      setSuccessMessage(
        "Your profile has been updated successfully."
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to update your profile";

      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="flex w-[245px] shrink-0 flex-col border-r border-[#333333] bg-[#181818]">
          {/* Brand */}
          <div className="border-b border-[#333333] px-7 py-7">
            <Link
              to="/"
              className="font-serif text-[17px] tracking-[0.08em] text-[#d7d2ca]"
            >
              URBAN THREAD
            </Link>
          </div>

          {/* User summary */}
          <div className="border-b border-[#333333] px-6 py-6">
            <div className="flex items-center gap-4">
              {user?.profileImage || user?.googleImage ? (
                <img
                  src={
                    user.profileImage ||
                    user.googleImage
                  }
                  alt={user.name || "User"}
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#292929] font-serif text-sm text-[#d7d2ca]">
                  {getInitials()}
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate font-serif text-[16px] text-[#d7d2ca]">
                  {user?.name || "User"}
                </p>

                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-gray-500">
                  Customer Account
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4">
            {menuItems.map((item) => {
              const isActive =
                location.pathname === item.path;

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-4 border-l-2 px-6 py-4 text-[11px] font-medium uppercase tracking-[0.16em] transition ${
                    isActive
                      ? "border-blue-500 bg-[#242424] text-[#e8e3dc]"
                      : "border-transparent text-gray-500 hover:bg-[#222222] hover:text-[#d7d2ca]"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-[#333333] p-6">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-4 text-[11px] uppercase tracking-[0.16em] text-gray-500 transition hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-5 w-5"
              >
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
                <path d="M21 19V5a2 2 0 0 0-2-2h-5" />
              </svg>

              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-6 py-10 sm:px-10 lg:px-14">
          <div className="max-w-5xl">
            <div className="mb-9">
              <h1 className="font-serif text-3xl text-[#e8e3dc] sm:text-4xl">
                Personal Information
              </h1>

              <p className="mt-3 text-sm text-gray-500">
                Update your details and manage your
                account information.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-md border border-[#2c2c2c] bg-[#1b1b1b] p-6 sm:p-8"
            >
              <div className="grid gap-7 md:grid-cols-2">
                {/* Full name */}
                <div>
                  <label
                    htmlFor="name"
                    className="text-[10px] uppercase tracking-[0.16em] text-gray-400"
                  >
                    Full Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-3 w-full border-b border-[#3a3a3a] bg-transparent px-0 py-3 text-sm text-[#e8e3dc] outline-none transition placeholder:text-gray-600 focus:border-gray-300"
                    placeholder="Enter your full name"
                  />

                  {errors.name && (
                    <p className="mt-2 text-xs text-red-400">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="text-[10px] uppercase tracking-[0.16em] text-gray-400"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="mt-3 w-full cursor-not-allowed border-b border-[#3a3a3a] bg-transparent px-0 py-3 text-sm text-gray-500 outline-none"
                  />

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[11px] text-gray-600">
                      Email changes require verification.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/profile/change-email")
                      }
                      className="border border-[#3a3a3a] px-4 py-2 text-[10px] uppercase tracking-[0.15em] text-gray-400 transition hover:border-gray-500 hover:text-white"
                    >
                      Change Email
                    </button>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="text-[10px] uppercase tracking-[0.16em] text-gray-400"
                  >
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-3 w-full border-b border-[#3a3a3a] bg-transparent px-0 py-3 text-sm text-[#e8e3dc] outline-none transition placeholder:text-gray-600 focus:border-gray-300"
                    placeholder="Enter your phone number"
                  />

                  {errors.phone && (
                    <p className="mt-2 text-xs text-red-400">
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Profile image */}
                <div>
                  <label
                    htmlFor="profileImage"
                    className="text-[10px] uppercase tracking-[0.16em] text-gray-400"
                  >
                    Profile Image
                  </label>

                  <div className="mt-4 flex items-center gap-5">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Profile preview"
                        className="h-20 w-20 rounded-full border border-[#3a3a3a] object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#292929] font-serif text-xl text-[#d7d2ca]">
                        {getInitials()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <input
                        id="profileImage"
                        name="profileImage"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="block w-full cursor-pointer text-xs text-gray-400 file:mr-4 file:rounded-md file:border-0 file:bg-[#e8e3dc] file:px-4 file:py-2 file:text-[10px] file:font-semibold file:uppercase file:tracking-[0.1em] file:text-[#171717] hover:file:bg-white"
                      />

                      <p className="mt-2 text-[11px] text-gray-600">
                        JPG, PNG, or WEBP. Maximum size: 2MB.
                      </p>
                    </div>
                  </div>

                  {errors.profileImage && (
                    <p className="mt-2 text-xs text-red-400">
                      {errors.profileImage}
                    </p>
                  )}
                </div>
              </div>

              {serverError && (
                <div className="mt-7 border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                  {serverError}
                </div>
              )}

              {successMessage && (
                <div className="mt-7 border border-green-900 bg-green-950/30 px-4 py-3 text-sm text-green-400">
                  {successMessage}
                </div>
              )}

              <div className="mt-9 flex flex-wrap justify-end gap-3 border-t border-[#2c2c2c] pt-7">
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="border border-[#3a3a3a] px-6 py-3 text-[10px] uppercase tracking-[0.15em] text-gray-400 transition hover:border-gray-500 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#e8e3dc] px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#171717] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>

            {/* Password section */}
            <div className="mt-6 rounded-md border border-[#2c2c2c] bg-[#1b1b1b] p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <h2 className="font-serif text-xl text-[#e8e3dc]">
                    Password
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Update your password to keep your
                    account secure.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/profile/change-password")
                  }
                  className="border border-[#3a3a3a] px-6 py-3 text-[10px] uppercase tracking-[0.15em] text-gray-400 transition hover:border-gray-500 hover:text-white"
                >
                  Change Password
                </button>
              </div>

              <p className="mt-4 text-xs text-gray-600">
                Use your current password to securely create
                a new password.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditProfile;