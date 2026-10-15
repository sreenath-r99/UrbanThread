
import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { getAddresses } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";

const Profile = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressError, setAddressError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchAddresses = async () => {
      try {
        setAddressLoading(true);
        setAddressError("");

        const response = await getAddresses(token);

        if (active) {
          setAddresses(response?.addresses || []);
        }
      } catch (error) {
        console.error("FETCH ADDRESSES ERROR:", error);

        if (active) {
          setAddressError(
            error.response?.data?.message ||
              "Unable to load saved addresses.",
          );
        }
      } finally {
        if (active) {
          setAddressLoading(false);
        }
      }
    };

    if (token) {
      fetchAddresses();
    } else {
      setAddresses([]);
      setAddressLoading(false);
    }

    return () => {
      active = false;
    };
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const getInitials = () => {
    if (!user?.name) return "U";

    return user.name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const menuItems = [
    {
      label: "Overview",
      path: "/profile",
      icon: "▦",
    },
    {
      label: "Personal Info",
      path: "/profile/edit",
      icon: "○",
    },
    {
      label: "Orders",
      path: "/orders",
      icon: "▤",
    },
    {
      label: "Wishlist",
      path: "/wishlist",
      icon: "♡",
    },
    {
      label: "Addresses",
      path: "/addresses",
      icon: "⌖",
    },
    {
      label: "Coupons",
      path: "/coupons",
      icon: "%",
    },
    {
      label: "My Wallet",
      path: "/wallet",
      icon: "₹",
    },
  ];

  const overviewCards = [
    {
      title: "Orders",
      description: "View your order history and track purchases.",
      action: "View Orders",
      path: "/orders",
      symbol: "▤",
    },
    {
      title: "Wishlist",
      description: "Access products you have saved.",
      action: "Manage Wishlist",
      path: "/wishlist",
      symbol: "♡",
    },
    {
      title: "Saved Addresses",
      description: addressLoading
        ? "Loading saved addresses..."
        : `${addresses.length} saved ${
            addresses.length === 1 ? "address" : "addresses"
          }`,
      action: "Manage Addresses",
      path: "/addresses",
      symbol: "⌖",
    },
    {
      title: "Coupons & Offers",
      description: "Explore available offers and coupons.",
      action: "View Offers",
      path: "/coupons",
      symbol: "%",
    },
  ];

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <div className="flex min-h-screen flex-col md:flex-row">
        {/* SIDEBAR */}

        <aside className="flex w-full shrink-0 flex-col border-b border-[#333333] bg-[#181818] md:min-h-screen md:w-[245px] md:border-b-0 md:border-r">
          <div className="border-b border-[#333333] px-6 py-6">
            <Link
              to="/"
              className="font-serif text-lg tracking-[0.08em] text-[#d7d2ca]"
            >
              URBAN THREAD
            </Link>
          </div>

          {/* USER SUMMARY */}

          <div className="border-b border-[#333333] px-6 py-6">
            <div className="flex items-center gap-4">
              {user?.profileImage || user?.googleImage ? (
                <img
                  src={user.profileImage || user.googleImage}
                  alt={user?.name || "User"}
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#292929] font-serif text-sm text-[#d7d2ca]">
                  {getInitials()}
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate font-serif text-base text-[#d7d2ca]">
                  {user?.name || "User"}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-gray-500">
                  Customer Account
                </p>
              </div>
            </div>
          </div>

          {/* NAVIGATION */}

          <nav className="grid grid-cols-2 py-3 sm:grid-cols-3 md:flex md:flex-1 md:flex-col md:py-4">
            {menuItems.map((item) => {
              const isActive =
                item.path === "/profile"
                  ? location.pathname === "/profile"
                  : location.pathname === item.path ||
                    location.pathname.startsWith(`${item.path}/`);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 border-l-2 px-4 py-3 text-[10px] font-medium uppercase tracking-[0.12em] transition sm:px-6 md:py-4 ${
                    isActive
                      ? "border-white bg-[#242424] text-[#e8e3dc]"
                      : "border-transparent text-gray-500 hover:bg-[#222222] hover:text-white"
                  }`}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-base">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* LOGOUT */}

          <div className="border-t border-[#333333] p-5 md:p-6">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 text-left text-[11px] uppercase tracking-[0.16em] text-gray-500 transition hover:text-white"
            >
              <span className="text-lg">↗</span>
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}

        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12">
          {/* PAGE HEADER */}

          <header className="flex flex-col justify-between gap-5 border-b border-[#292929] pb-7 md:flex-row md:items-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
                Customer Account
              </p>

              <h1 className="mt-2 font-serif text-3xl text-[#e8e3dc] sm:text-4xl">
                {user?.name || "My Account"}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
                Manage your UrbanThread account, orders, addresses, offers,
                and wallet in one place.
              </p>
            </div>

            <div
              className={`inline-flex w-fit items-center gap-2 border px-4 py-2 text-[10px] uppercase tracking-[0.16em] ${
                user?.isVerified
                  ? "border-[#3a3a3a] text-gray-400"
                  : "border-yellow-900 text-yellow-600"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  user?.isVerified ? "bg-gray-400" : "bg-yellow-600"
                }`}
              />
              {user?.isVerified ? "Verified Account" : "Unverified Account"}
            </div>
          </header>

          {/* ACCOUNT OVERVIEW */}

          <section className="mt-9">
            <h2 className="font-serif text-2xl text-[#e8e3dc]">
              Account Overview
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Choose a section below to manage your account.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {overviewCards.map((card) => (
                <article
                  key={card.path}
                  className="border border-[#2c2c2c] bg-[#1b1b1b] p-5 transition hover:border-[#454545]"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center border border-[#333333] text-xl text-gray-400">
                      {card.symbol}
                    </span>
                    <span className="font-serif text-3xl text-[#343434]">
                      {card.path === "/addresses"
                        ? addressLoading
                          ? "—"
                          : addresses.length
                        : "↗"}
                    </span>
                  </div>

                  <h3 className="mt-6 text-sm font-medium text-[#e8e3dc]">
                    {card.title}
                  </h3>

                  <p className="mt-2 min-h-10 text-xs leading-5 text-gray-500">
                    {card.description}
                  </p>

                  <Link
                    to={card.path}
                    className="mt-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-gray-400 transition hover:text-white"
                  >
                    {card.action}
                    <span>→</span>
                  </Link>
                </article>
              ))}

              {/* WALLET CARD */}

              <Link
                to="/wallet"
                className="group border border-[#454545] bg-[#151515] p-5 transition hover:border-gray-300 hover:bg-[#1b1b1b] sm:col-span-2 xl:col-span-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center border border-[#454545] font-serif text-xl text-[#e8e3dc]">
                    ₹
                  </div>

                  <span className="font-serif text-3xl text-[#343434]">
                    →
                  </span>
                </div>

                <p className="mt-6 text-[10px] uppercase tracking-[0.16em] text-gray-400">
                  UrbanThread Wallet
                </p>

                <h3 className="mt-2 font-serif text-2xl text-[#e8e3dc]">
                  My Wallet
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Check your wallet balance, view refunds and wallet
                  transactions, and use your balance during checkout.
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-[#303030] pt-4">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-gray-300">
                    Open Wallet
                  </span>
                  <span className="transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>

              {/* PERSONAL INFORMATION CARD */}

              <article className="border border-[#2c2c2c] bg-[#1b1b1b] p-5 sm:col-span-2 xl:col-span-1">
                <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500">
                  Account Details
                </p>

                <h3 className="mt-3 font-serif text-2xl text-[#e8e3dc]">
                  Personal Info
                </h3>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.16em] text-gray-500">
                      Full Name
                    </p>
                    <p className="mt-1 break-words text-sm text-gray-300">
                      {user?.name || "Not available"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.16em] text-gray-500">
                      Email Address
                    </p>
                    <p className="mt-1 break-all text-sm text-gray-300">
                      {user?.email || "Not available"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.16em] text-gray-500">
                      Phone Number
                    </p>
                    <p className="mt-1 text-sm text-gray-300">
                      {user?.phone || "Not added"}
                    </p>
                  </div>
                </div>

                <Link
                  to="/profile/edit"
                  className="mt-6 inline-flex border-b border-gray-600 pb-1 text-[10px] uppercase tracking-[0.15em] text-gray-400 transition hover:border-white hover:text-white"
                >
                  Edit Personal Info
                </Link>
              </article>
            </div>
          </section>

          {/* SAVED ADDRESSES */}

          <section className="mt-10 border-t border-[#292929] pt-9">
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
                        addresses.length === 1 ? "address" : "addresses"
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

            {addressLoading && (
              <div className="border border-[#2c2c2c] bg-[#1b1b1b] p-7">
                <p className="text-sm text-gray-500">
                  Loading saved addresses...
                </p>
              </div>
            )}

            {!addressLoading && addressError && (
              <div
                role="alert"
                className="border border-red-900/50 bg-red-950/20 p-5"
              >
                <p className="text-sm text-red-400">{addressError}</p>
                <Link
                  to="/addresses"
                  className="mt-3 inline-block text-xs text-gray-300 underline hover:text-white"
                >
                  Open address management
                </Link>
              </div>
            )}

            {!addressLoading &&
              !addressError &&
              addresses.length === 0 && (
                <div className="border border-dashed border-[#3a3a3a] bg-[#151515] p-8 text-center">
                  <p className="text-sm text-gray-400">
                    No saved addresses yet.
                  </p>
                  <p className="mt-2 text-xs text-gray-600">
                    Add an address for a faster checkout experience.
                  </p>
                  <Link
                    to="/addresses"
                    className="mt-5 inline-block border border-[#3a3a3a] px-5 py-3 text-[10px] uppercase tracking-[0.15em] text-gray-300 transition hover:border-gray-500 hover:text-white"
                  >
                    Add an Address
                  </Link>
                </div>
              )}

            {!addressLoading &&
              !addressError &&
              addresses.length > 0 && (
                <div className="grid gap-5 md:grid-cols-2">
                  {addresses.map((address) => (
                    <article
                      key={address._id}
                      className="border border-[#2c2c2c] bg-[#1b1b1b] p-6 transition hover:border-[#454545]"
                    >
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

                      <div className="space-y-2 text-sm leading-6 text-gray-400">
                        <p className="font-medium text-white">
                          {address.fullName}
                        </p>
                        {address.phone && <p>{address.phone}</p>}
                        {address.houseName && <p>{address.houseName}</p>}
                        {address.street && <p>{address.street}</p>}
                        <p>
                          {[address.city, address.state]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        <p>
                          {[address.pincode, address.country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
          </section>

          {/* WALLET SHORTCUT */}

          <section className="mt-10 border-t border-[#292929] pt-8">
            <div className="flex flex-col justify-between gap-4 border border-[#333333] bg-[#181818] p-5 sm:flex-row sm:items-center sm:p-7">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                  Payments & Refunds
                </p>
                <h2 className="mt-2 font-serif text-xl text-[#e8e3dc]">
                  Need to check your wallet?
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  View available balance and wallet transaction history.
                </p>
              </div>

              <Link
                to="/wallet"
                className="inline-flex w-fit items-center gap-3 bg-white px-5 py-3 text-[10px] font-medium uppercase tracking-[0.14em] text-black transition hover:bg-neutral-200"
              >
                Go to Wallet
                <span>→</span>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Profile;