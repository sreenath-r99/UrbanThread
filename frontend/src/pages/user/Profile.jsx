import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { getAddresses } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";

const Profile = () => {
  const {
    user,
    token,
    logout,
  } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  // ==========================
  // ADDRESS STATE
  // ==========================

  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressError, setAddressError] = useState("");

  // ==========================
  // FETCH USER ADDRESSES
  // ==========================

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setAddressLoading(true);
        setAddressError("");

        const response = await getAddresses(token);

        setAddresses(response.addresses || []);
      } catch (error) {
        console.error(
          "FETCH ADDRESSES ERROR:",
          error
        );

        setAddressError(
          error.response?.data?.message ||
            "Unable to load addresses"
        );
      } finally {
        setAddressLoading(false);
      }
    };

    if (token) {
      fetchAddresses();
    } else {
      setAddressLoading(false);
    }
  }, [token]);

  // ==========================
  // LOGOUT
  // ==========================

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
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
  // PHONE FORMAT
  // ==========================

  const formatPhone = () => {
    return user?.phone || "Not added";
  };

  // ==========================
  // SIDEBAR MENU
  // ==========================

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
          <path
            d="M5 20c.8-3.3 3.2-5 7-5s6.2 1.7 7 5"
          />
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

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <div className="flex min-h-screen">

        {/* ======================
            SIDEBAR
        ====================== */}

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

          {/* User Summary */}

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

          {/* Navigation */}

          <nav className="flex-1 py-4">
            {menuItems.map((item) => {
              const isActive =
                currentPath === item.path;

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

        {/* ======================
            MAIN CONTENT
        ====================== */}

        <main className="flex-1 px-6 py-8 sm:px-10 lg:px-14">

          {/* Header */}

          <div className="flex flex-col justify-between gap-5 border-b border-[#292929] pb-7 md:flex-row md:items-center">
            <div>
              <h1 className="font-serif text-3xl text-[#e8e3dc] sm:text-4xl">
                {user?.name || "User"}
              </h1>

              <p className="mt-3 text-sm text-gray-500">
                Welcome back to UrbanThread. Here is a
                summary of your account activity.
              </p>
            </div>

            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.16em] ${
                user?.isVerified
                  ? "border-[#3a3a3a] text-gray-400"
                  : "border-yellow-900 text-yellow-600"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  user?.isVerified
                    ? "bg-gray-400"
                    : "bg-yellow-600"
                }`}
              />

              {user?.isVerified
                ? "Verified Account"
                : "Unverified Account"}
            </div>
          </div>

          {/* Overview Heading */}

          <div className="mt-9">
            <h2 className="font-serif text-2xl text-[#e8e3dc]">
              Account Overview
            </h2>
          </div>

          {/* Overview and Personal Info */}

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">

            {/* Overview Cards */}

            <div className="grid gap-4 sm:grid-cols-2">

              {/* Orders Card */}

              <div className="group rounded-md border border-[#2c2c2c] bg-[#1b1b1b] p-5 transition hover:border-[#454545]">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#333333] text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      className="h-5 w-5"
                    >
                      <path d="M6 4h12l2 4v12H4V8l2-4Z" />
                      <path d="M4 8h16" />
                      <path d="M9 12h6" />
                    </svg>
                  </div>

                  <span className="font-serif text-3xl text-[#343434]">
                    0
                  </span>
                </div>

                <p className="mt-6 text-[10px] uppercase tracking-[0.16em] text-gray-500">
                  Total Orders
                </p>

                <Link
                  to="/orders"
                  className="mt-4 inline-block text-[10px] uppercase tracking-[0.14em] text-gray-400 transition hover:text-white"
                >
                  View History
                </Link>
              </div>

              {/* Wishlist Card */}

              <div className="group rounded-md border border-[#2c2c2c] bg-[#1b1b1b] p-5 transition hover:border-[#454545]">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#333333] text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      className="h-5 w-5"
                    >
                      <path d="M20.8 8.8c0 5.5-8.8 10.2-8.8 10.2S3.2 14.3 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />
                    </svg>
                  </div>

                  <span className="font-serif text-3xl text-[#343434]">
                    0
                  </span>
                </div>

                <p className="mt-6 text-[10px] uppercase tracking-[0.16em] text-gray-500">
                  Wishlist Items
                </p>

                <Link
                  to="/wishlist"
                  className="mt-4 inline-block text-[10px] uppercase tracking-[0.14em] text-gray-400 transition hover:text-white"
                >
                  Manage Wishlist
                </Link>
              </div>

              {/* Address Count Card */}

              <div className="group rounded-md border border-[#2c2c2c] bg-[#1b1b1b] p-5 transition hover:border-[#454545]">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#333333] text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      className="h-5 w-5"
                    >
                      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                      <circle
                        cx="12"
                        cy="10"
                        r="2.5"
                      />
                    </svg>
                  </div>

                  <span className="font-serif text-3xl text-[#343434]">
                    {addressLoading ? "—" : addresses.length}
                  </span>
                </div>

                <p className="mt-6 text-[10px] uppercase tracking-[0.16em] text-gray-500">
                  Saved Addresses
                </p>

                <Link
                  to="/addresses"
                  className="mt-4 inline-block text-[10px] uppercase tracking-[0.14em] text-gray-400 transition hover:text-white"
                >
                  Edit Addresses
                </Link>
              </div>

              {/* Coupons Card */}

              <div className="group rounded-md border border-[#2c2c2c] bg-[#1b1b1b] p-5 transition hover:border-[#454545]">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#333333] text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      className="h-5 w-5"
                    >
                      <path d="M20 12a2 2 0 0 0 0-4V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v3a2 2 0 0 0 0 4v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3Z" />
                      <path d="M12 7v2" />
                      <path d="M12 15v2" />
                    </svg>
                  </div>

                  <span className="font-serif text-3xl text-[#343434]">
                    0
                  </span>
                </div>

                <p className="mt-6 text-[10px] uppercase tracking-[0.16em] text-gray-500">
                  Active Coupons
                </p>

                <Link
                  to="/coupons"
                  className="mt-4 inline-block text-[10px] uppercase tracking-[0.14em] text-gray-400 transition hover:text-white"
                >
                  View Offers
                </Link>
              </div>
            </div>

            {/* Personal Information Card */}

            <div className="rounded-md border border-[#2c2c2c] bg-[#1b1b1b] p-6">
              <h3 className="font-serif text-xl text-[#e8e3dc]">
                Personal Info
              </h3>

              <div className="mt-7 space-y-6">

                {/* Full Name */}

                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-gray-500">
                    Full Name
                  </p>

                  <p className="mt-2 text-sm text-gray-300">
                    {user?.name || "Not available"}
                  </p>
                </div>

                {/* Email */}

                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-gray-500">
                    Email Address
                  </p>

                  <p className="mt-2 break-all text-sm text-gray-300">
                    {user?.email || "Not available"}
                  </p>
                </div>

                {/* Phone */}

                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-gray-500">
                    Phone Number
                  </p>

                  <p className="mt-2 text-sm text-gray-300">
                    {formatPhone()}
                  </p>
                </div>
              </div>

              <Link
                to="/profile/edit"
                className="mt-8 inline-flex border-b border-gray-600 pb-1 text-[10px] uppercase tracking-[0.15em] text-gray-400 transition hover:border-white hover:text-white"
              >
                Edit Personal Info
              </Link>
            </div>
          </div>

          {/* ==========================
              SAVED ADDRESSES SECTION
          ========================== */}

          <section className="mt-10 border-t border-[#292929] pt-9">

            {/* Address Header */}

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
                  Delivery Information
                </p>

                <h2 className="mt-2 font-serif text-2xl text-[#e8e3dc]">
                  Saved Addresses
                </h2>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[11px] text-gray-500">
                  {addressLoading
                    ? "Loading..."
                    : `${addresses.length} ${
                        addresses.length === 1
                          ? "Address"
                          : "Addresses"
                      }`}
                </span>

                <Link
                  to="/addresses"
                  className="border border-[#3a3a3a] px-4 py-2 text-[10px] uppercase tracking-[0.15em] text-gray-400 transition hover:border-gray-500 hover:text-white"
                >
                  Manage
                </Link>
              </div>
            </div>

            {/* Loading State */}

            {addressLoading && (
              <div className="border border-[#2c2c2c] bg-[#1b1b1b] p-7">
                <p className="text-sm text-gray-500">
                  Loading saved addresses...
                </p>
              </div>
            )}

            {/* Error State */}

            {!addressLoading && addressError && (
              <div className="border border-red-900/50 bg-red-950/20 p-7">
                <p className="text-sm text-red-400">
                  {addressError}
                </p>
              </div>
            )}

            {/* Empty State */}

            {!addressLoading &&
              !addressError &&
              addresses.length === 0 && (
                <div className="border border-dashed border-[#3a3a3a] bg-[#151515] p-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#333333] text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="h-5 w-5"
                    >
                      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                      <circle
                        cx="12"
                        cy="10"
                        r="2.5"
                      />
                    </svg>
                  </div>

                  <p className="mt-4 text-sm text-gray-400">
                    No saved addresses yet.
                  </p>

                  <p className="mt-2 text-xs text-gray-600">
                    Your saved delivery addresses will appear here.
                  </p>

                  <Link
                    to="/addresses"
                    className="mt-6 inline-block border border-[#3a3a3a] px-5 py-3 text-[10px] uppercase tracking-[0.15em] text-gray-400 transition hover:border-gray-500 hover:text-white"
                  >
                    Add Your First Address
                  </Link>
                </div>
              )}

            {/* Address Cards */}

            {!addressLoading &&
              !addressError &&
              addresses.length > 0 && (
                <div className="grid gap-5 md:grid-cols-2">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className="border border-[#2c2c2c] bg-[#1b1b1b] p-6 transition hover:border-[#454545]"
                    >
                      {/* Card Header */}

                      <div className="mb-5 flex items-center justify-between gap-3">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400">
                          {address.addressType || "Address"}
                        </p>

                        {address.isDefault && (
                          <span className="border border-[#555555] px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-gray-300">
                            Default
                          </span>
                        )}
                      </div>

                      {/* Address Details */}

                      <div className="space-y-2 text-sm leading-6 text-gray-400">
                        <p className="font-medium text-white">
                          {address.fullName}
                        </p>

                        <p>{address.phone}</p>

                        <p>{address.houseName}</p>

                        <p>{address.street}</p>

                        <p>
                          {address.city}, {address.state}
                        </p>

                        <p>
                          {address.pincode},{" "}
                          {address.country}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Profile;