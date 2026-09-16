import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";

import {
  getAddresses,
  deleteAddress,
  setDefaultAddress,
} from "../../services/authService";

const Addresses = () => {
  const { user, token, logout } = useContext(AuthContext);

  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // FETCH ADDRESSES
  // =====================================================

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAddresses(token);

      setAddresses(response.addresses || []);
    } catch (error) {
      console.error("FETCH ADDRESSES ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load addresses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAddresses();
    } else {
      setLoading(false);
    }
  }, [token]);

  // =====================================================
  // DELETE ADDRESS
  // =====================================================

  const handleDelete = async (addressId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(addressId);
      setError("");
      setSuccess("");

      await deleteAddress(addressId, token);

      setAddresses((previousAddresses) =>
        previousAddresses.filter(
          (address) => address._id !== addressId
        )
      );

      setSuccess("Address deleted successfully");
    } catch (error) {
      console.error("DELETE ADDRESS ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to delete address"
      );
    } finally {
      setActionLoading("");
    }
  };

  // =====================================================
  // SET DEFAULT ADDRESS
  // =====================================================

  const handleSetDefault = async (addressId) => {
    try {
      setActionLoading(addressId);
      setError("");
      setSuccess("");

      await setDefaultAddress(addressId, token);

      setAddresses((previousAddresses) =>
        previousAddresses
          .map((address) => ({
            ...address,
            isDefault: address._id === addressId,
          }))
          .sort(
            (firstAddress, secondAddress) =>
              Number(secondAddress.isDefault) -
              Number(firstAddress.isDefault)
          )
      );

      setSuccess("Default address updated successfully");
    } catch (error) {
      console.error(
        "SET DEFAULT ADDRESS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to set default address"
      );
    } finally {
      setActionLoading("");
    }
  };

  // =====================================================
  // USER INITIALS
  // =====================================================

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

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    logout();

    navigate("/", {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}

        <aside className="flex w-[245px] shrink-0 flex-col border-r border-[#333333] bg-[#181818]">
          {/* BRAND */}

          <div className="border-b border-[#333333] px-7 py-7">
            <Link
              to="/"
              className="font-serif text-[17px] tracking-[0.08em] text-[#d7d2ca]"
            >
              URBAN THREAD
            </Link>
          </div>

          {/* USER DETAILS */}

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

          {/* NAVIGATION */}

          <nav className="flex-1 py-4">
            <Link
              to="/profile"
              className="block border-l-2 border-transparent px-6 py-4 text-[11px] uppercase tracking-[0.16em] text-gray-500 hover:bg-[#222222] hover:text-[#d7d2ca]"
            >
              Overview
            </Link>

            <Link
              to="/profile/edit"
              className="block border-l-2 border-transparent px-6 py-4 text-[11px] uppercase tracking-[0.16em] text-gray-500 hover:bg-[#222222] hover:text-[#d7d2ca]"
            >
              Personal Info
            </Link>

            <Link
              to="/orders"
              className="block border-l-2 border-transparent px-6 py-4 text-[11px] uppercase tracking-[0.16em] text-gray-500 hover:bg-[#222222] hover:text-[#d7d2ca]"
            >
              Orders
            </Link>

            <Link
              to="/wishlist"
              className="block border-l-2 border-transparent px-6 py-4 text-[11px] uppercase tracking-[0.16em] text-gray-500 hover:bg-[#222222] hover:text-[#d7d2ca]"
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
              className="block border-l-2 border-transparent px-6 py-4 text-[11px] uppercase tracking-[0.16em] text-gray-500 hover:bg-[#222222] hover:text-[#d7d2ca]"
            >
              Coupons
            </Link>
          </nav>

          {/* LOGOUT */}

          <div className="border-t border-[#333333] p-6">
            <button
              type="button"
              onClick={handleLogout}
              className="text-[11px] uppercase tracking-[0.16em] text-gray-500 hover:text-white"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}

        <main className="flex-1 px-6 py-8 sm:px-10 lg:px-14">
          {/* PAGE HEADER */}

          <div className="flex flex-col justify-between gap-5 border-b border-[#292929] pb-7 md:flex-row md:items-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
                Customer Account
              </p>

              <h1 className="mt-3 font-serif text-3xl text-[#e8e3dc] sm:text-4xl">
                Saved Addresses
              </h1>

              <p className="mt-3 text-sm text-gray-500">
                Manage your delivery addresses for a
                faster checkout experience.
              </p>
            </div>

            <Link
              to="/profile"
              className="w-fit border border-[#3a3a3a] px-5 py-3 text-[10px] uppercase tracking-[0.15em] text-gray-400 hover:border-gray-500 hover:text-white"
            >
              Back to Profile
            </Link>
          </div>

          {/* ADDRESS HEADER */}

          <div className="mt-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-serif text-2xl text-[#e8e3dc]">
                Your Addresses
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {addresses.length}{" "}
                {addresses.length === 1
                  ? "address"
                  : "addresses"}{" "}
                saved
              </p>
            </div>

            <Link
              to="/addresses/add"
              className="w-fit border border-white bg-white px-5 py-3 text-[10px] uppercase tracking-[0.15em] text-black hover:bg-gray-200"
            >
              Add New Address
            </Link>
          </div>

          {/* SUCCESS MESSAGE */}

          {success && (
            <div className="mt-6 border border-green-900/50 bg-green-950/20 p-4">
              <p className="text-sm text-green-400">
                {success}
              </p>
            </div>
          )}

          {/* ERROR MESSAGE */}

          {error && (
            <div className="mt-6 border border-red-900/50 bg-red-950/20 p-4">
              <p className="text-sm text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* LOADING */}

          {loading && (
            <div className="mt-7 border border-[#2c2c2c] bg-[#1b1b1b] p-8">
              <p className="text-sm text-gray-500">
                Loading saved addresses...
              </p>
            </div>
          )}

          {/* EMPTY STATE */}

          {!loading &&
            !error &&
            addresses.length === 0 && (
              <div className="mt-7 border border-dashed border-[#3a3a3a] bg-[#151515] p-12 text-center">
                <h3 className="font-serif text-xl text-[#e8e3dc]">
                  No saved addresses
                </h3>

                <p className="mx-auto mt-3 max-w-md text-sm text-gray-500">
                  You have not added a delivery address
                  yet.
                </p>

                <Link
                  to="/addresses/add"
                  className="mt-6 inline-block border border-white bg-white px-6 py-3 text-[10px] uppercase tracking-[0.15em] text-black hover:bg-gray-200"
                >
                  Add Your First Address
                </Link>
              </div>
            )}

          {/* ADDRESS CARDS */}

          {!loading && addresses.length > 0 && (
            <div className="mt-7 grid gap-5 lg:grid-cols-2">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className="border border-[#2c2c2c] bg-[#1b1b1b] p-7 hover:border-[#454545]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400">
                      {address.addressType || "Address"}
                    </p>

                    {address.isDefault && (
                      <span className="border border-[#555555] px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-gray-300">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="mt-6 space-y-2 text-sm leading-6 text-gray-400">
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

                  {/* ACTION BUTTONS */}

                  <div className="mt-7 flex flex-wrap gap-3 border-t border-[#2c2c2c] pt-5">
                    <Link
                      to={`/addresses/edit/${address._id}`}
                      className="border border-[#3a3a3a] px-4 py-2 text-[10px] uppercase tracking-[0.12em] text-gray-400 hover:border-gray-500 hover:text-white"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(address._id)
                      }
                      disabled={
                        actionLoading === address._id
                      }
                      className="border border-red-900/60 px-4 py-2 text-[10px] uppercase tracking-[0.12em] text-red-400 hover:border-red-500 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actionLoading === address._id
                        ? "Please wait..."
                        : "Delete"}
                    </button>

                    {!address.isDefault && (
                      <button
                        type="button"
                        onClick={() =>
                          handleSetDefault(address._id)
                        }
                        disabled={
                          actionLoading === address._id
                        }
                        className="border border-[#3a3a3a] px-4 py-2 text-[10px] uppercase tracking-[0.12em] text-gray-400 hover:border-gray-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Addresses;