import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";
import { createAddress } from "../../services/authService";

const AddAddress = () => {
  const { user, token, logout } = useContext(AuthContext);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    houseName: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    addressType: "Home",
    isDefault: false,
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================
  // HANDLE INPUT CHANGE
  // ==========================

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));

    setSubmitError("");
  };

  // ==========================
  // FRONTEND VALIDATION
  // ==========================

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName =
        "Full name must contain at least 2 characters";
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone =
        "Enter a valid 10-digit Indian phone number";
    }

    if (!formData.houseName.trim()) {
      newErrors.houseName =
        "House or building name is required";
    }

    if (!formData.street.trim()) {
      newErrors.street =
        "Street or area is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode =
        "Pincode must contain exactly 6 digits";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ==========================
  // SUBMIT FORM
  // ==========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await createAddress(formData, token);

      navigate("/addresses", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "CREATE ADDRESS ERROR:",
        error
      );

      setSubmitError(
        error.response?.data?.message ||
          "Unable to add address"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // USER INITIALS
  // ==========================

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

  // ==========================
  // LOGOUT
  // ==========================

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  // ==========================
  // INPUT COMPONENT
  // ==========================

  const inputClassName =
    "mt-2 w-full border-b border-[#3a3a3a] bg-transparent px-0 py-3 text-sm text-[#e8e3dc] outline-none transition placeholder:text-gray-700 focus:border-gray-400";

  const errorClassName =
    "mt-2 text-[11px] text-red-400";

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <div className="flex min-h-screen">

        {/* ======================
            SIDEBAR
        ====================== */}

        <aside className="flex w-[245px] shrink-0 flex-col border-r border-[#333333] bg-[#181818]">

          <div className="border-b border-[#333333] px-7 py-7">
            <Link
              to="/"
              className="font-serif text-[17px] tracking-[0.08em] text-[#d7d2ca]"
            >
              URBAN THREAD
            </Link>
          </div>

          <div className="border-b border-[#333333] px-6 py-6">
            <div className="flex items-center gap-4">
              {user?.profileImage || user?.googleImage ? (
                <img
                  src={
                    user.profileImage ||
                    user.googleImage
                  }
                  alt={user.name}
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

          <nav className="flex-1 py-4">
            <Link
              to="/profile"
              className="block border-l-2 border-transparent px-6 py-4 text-[11px] uppercase tracking-[0.16em] text-gray-500 transition hover:bg-[#222222] hover:text-[#d7d2ca]"
            >
              Overview
            </Link>

            <Link
              to="/profile/edit"
              className="block border-l-2 border-transparent px-6 py-4 text-[11px] uppercase tracking-[0.16em] text-gray-500 transition hover:bg-[#222222] hover:text-[#d7d2ca]"
            >
              Personal Info
            </Link>

            <Link
              to="/orders"
              className="block border-l-2 border-transparent px-6 py-4 text-[11px] uppercase tracking-[0.16em] text-gray-500 transition hover:bg-[#222222] hover:text-[#d7d2ca]"
            >
              Orders
            </Link>

            <Link
              to="/wishlist"
              className="block border-l-2 border-transparent px-6 py-4 text-[11px] uppercase tracking-[0.16em] text-gray-500 transition hover:bg-[#222222] hover:text-[#d7d2ca]"
            >
              Wishlist
            </Link>

            <Link
              to="/addresses"
              className="block border-l-2 border-blue-500 bg-[#242424] px-6 py-4 text-[11px] uppercase tracking-[0.16em] text-[#e8e3dc]"
            >
              Addresses
            </Link>

            <Link
              to="/coupons"
              className="block border-l-2 border-transparent px-6 py-4 text-[11px] uppercase tracking-[0.16em] text-gray-500 transition hover:bg-[#222222] hover:text-[#d7d2ca]"
            >
              Coupons
            </Link>
          </nav>

          <div className="border-t border-[#333333] p-6">
            <button
              type="button"
              onClick={handleLogout}
              className="text-[11px] uppercase tracking-[0.16em] text-gray-500 transition hover:text-white"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* ======================
            MAIN CONTENT
        ====================== */}

        <main className="flex-1 px-6 py-8 sm:px-10 lg:px-14">

          {/* Header */}

          <div className="flex flex-col justify-between gap-5 border-b border-[#292929] pb-7 md:flex-row md:items-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
                Customer Account
              </p>

              <h1 className="mt-3 font-serif text-3xl text-[#e8e3dc] sm:text-4xl">
                Add New Address
              </h1>

              <p className="mt-3 text-sm text-gray-500">
                Add a delivery address for your orders.
              </p>
            </div>

            <Link
              to="/addresses"
              className="w-fit border border-[#3a3a3a] px-5 py-3 text-[10px] uppercase tracking-[0.15em] text-gray-400 transition hover:border-gray-500 hover:text-white"
            >
              Back to Addresses
            </Link>
          </div>

          {/* Form Container */}

          <div className="mt-9 max-w-4xl border border-[#2c2c2c] bg-[#1b1b1b] p-6 sm:p-8 lg:p-10">

            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
                Delivery Details
              </p>

              <h2 className="mt-2 font-serif text-2xl text-[#e8e3dc]">
                Address Information
              </h2>
            </div>

            {submitError && (
              <div className="mb-7 border border-red-900/50 bg-red-950/20 p-4">
                <p className="text-sm text-red-400">
                  {submitError}
                </p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="grid gap-x-8 gap-y-7 md:grid-cols-2">

                {/* Full Name */}

                <div>
                  <label
                    htmlFor="fullName"
                    className="text-[10px] uppercase tracking-[0.16em] text-gray-400"
                  >
                    Full Name
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className={inputClassName}
                  />

                  {errors.fullName && (
                    <p className={errorClassName}>
                      {errors.fullName}
                    </p>
                  )}
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
                    maxLength={10}
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className={inputClassName}
                  />

                  {errors.phone && (
                    <p className={errorClassName}>
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* House Name */}

                <div>
                  <label
                    htmlFor="houseName"
                    className="text-[10px] uppercase tracking-[0.16em] text-gray-400"
                  >
                    House / Building
                  </label>

                  <input
                    id="houseName"
                    name="houseName"
                    type="text"
                    value={formData.houseName}
                    onChange={handleChange}
                    placeholder="House name or building"
                    className={inputClassName}
                  />

                  {errors.houseName && (
                    <p className={errorClassName}>
                      {errors.houseName}
                    </p>
                  )}
                </div>

                {/* Street */}

                <div>
                  <label
                    htmlFor="street"
                    className="text-[10px] uppercase tracking-[0.16em] text-gray-400"
                  >
                    Street / Area
                  </label>

                  <input
                    id="street"
                    name="street"
                    type="text"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="Street, locality or area"
                    className={inputClassName}
                  />

                  {errors.street && (
                    <p className={errorClassName}>
                      {errors.street}
                    </p>
                  )}
                </div>

                {/* City */}

                <div>
                  <label
                    htmlFor="city"
                    className="text-[10px] uppercase tracking-[0.16em] text-gray-400"
                  >
                    City
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    className={inputClassName}
                  />

                  {errors.city && (
                    <p className={errorClassName}>
                      {errors.city}
                    </p>
                  )}
                </div>

                {/* State */}

                <div>
                  <label
                    htmlFor="state"
                    className="text-[10px] uppercase tracking-[0.16em] text-gray-400"
                  >
                    State
                  </label>

                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    className={inputClassName}
                  />

                  {errors.state && (
                    <p className={errorClassName}>
                      {errors.state}
                    </p>
                  )}
                </div>

                {/* Pincode */}

                <div>
                  <label
                    htmlFor="pincode"
                    className="text-[10px] uppercase tracking-[0.16em] text-gray-400"
                  >
                    Pincode
                  </label>

                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Enter 6-digit pincode"
                    className={inputClassName}
                  />

                  {errors.pincode && (
                    <p className={errorClassName}>
                      {errors.pincode}
                    </p>
                  )}
                </div>

                {/* Country */}

                <div>
                  <label
                    htmlFor="country"
                    className="text-[10px] uppercase tracking-[0.16em] text-gray-400"
                  >
                    Country
                  </label>

                  <input
                    id="country"
                    name="country"
                    type="text"
                    value={formData.country}
                    onChange={handleChange}
                    className={inputClassName}
                  />

                  {errors.country && (
                    <p className={errorClassName}>
                      {errors.country}
                    </p>
                  )}
                </div>

                {/* Address Type */}

                <div>
                  <label
                    htmlFor="addressType"
                    className="text-[10px] uppercase tracking-[0.16em] text-gray-400"
                  >
                    Address Type
                  </label>

                  <select
                    id="addressType"
                    name="addressType"
                    value={formData.addressType}
                    onChange={handleChange}
                    className="mt-2 w-full border-b border-[#3a3a3a] bg-[#1b1b1b] px-0 py-3 text-sm text-[#e8e3dc] outline-none focus:border-gray-400"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Default Address */}

                <div className="flex items-center self-end pb-3">
                  <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-400">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleChange}
                      className="h-4 w-4 accent-gray-400"
                    />

                    <span>
                      Set as default address
                    </span>
                  </label>
                </div>
              </div>

              {/* Buttons */}

              <div className="mt-10 flex flex-col-reverse gap-4 border-t border-[#2c2c2c] pt-7 sm:flex-row sm:justify-end">
                <Link
                  to="/addresses"
                  className="border border-[#3a3a3a] px-6 py-3 text-center text-[10px] uppercase tracking-[0.15em] text-gray-400 transition hover:border-gray-500 hover:text-white"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={loading}
                  className="border border-white bg-white px-7 py-3 text-[10px] uppercase tracking-[0.15em] text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddAddress;