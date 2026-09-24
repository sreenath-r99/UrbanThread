import { useContext, useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";

import { getAddresses, createAddress } from "../../services/authService";

import { getCart } from "../../services/cartService";

import { createOrder } from "../../services/orderService";

import {
  getAvailableCoupons,
  applyCoupon,
} from "../../services/availableCouponService.js";

const initialAddress = {
  fullName: "",
  phone: "",
  houseName: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  addressType: "Home",
  isDefault: false,
};

const Checkout = () => {
  const navigate = useNavigate();

  const { token } = useContext(AuthContext);

  const [cart, setCart] = useState(null);

  const [addresses, setAddresses] = useState([]);

  const [selectedAddressId, setSelectedAddressId] = useState("");

  const [loading, setLoading] = useState(true);

  const [placingOrder, setPlacingOrder] = useState(false);

  const [showAddressForm, setShowAddressForm] = useState(false);

  const [addressForm, setAddressForm] = useState(initialAddress);

  const [addressLoading, setAddressLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [availableCoupons, setAvailableCoupons] = useState([]);

  const [couponLoading, setCouponLoading] = useState(true);

  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const [couponApplying, setCouponApplying] = useState("");

  const formatPrice = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  const getImageUrl = (product) => {
    const image = product?.images?.[0];

    if (!image) {
      return "";
    }

    if (typeof image === "string") {
      return image;
    }

    return image.url || "";
  };

  const loadCheckoutData = async () => {
    if (!token) {
      navigate("/", {
        replace: true,
      });

      return;
    }

    try {
      setLoading(true);
      setCouponLoading(true);
      setError("");

      const [cartResponse, addressResponse] = await Promise.all([
        getCart(token),
        getAddresses(token),
      ]);

      const currentCart = cartResponse?.cart || {
        items: [],
        itemCount: 0,
        subtotal: 0,
      };

      const currentAddresses = Array.isArray(addressResponse?.addresses)
        ? addressResponse.addresses
        : [];

      setCart(currentCart);
      setAddresses(currentAddresses);

      const defaultAddress = currentAddresses.find(
        (address) => address.isDefault,
      );

      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
      } else if (currentAddresses.length > 0) {
        setSelectedAddressId(currentAddresses[0]._id);
      }

      /*
       * Coupon eligibility depends on the current cart subtotal, so
       * coupons are loaded only after the cart has been loaded.
       */
      const subtotal = Number(currentCart?.subtotal || 0);

      try {
        const couponResponse = await getAvailableCoupons(token, subtotal);

        setAvailableCoupons(
          Array.isArray(couponResponse?.coupons) ? couponResponse.coupons : [],
        );
      } catch (couponError) {
        console.error("LOAD APPLICABLE COUPONS ERROR:", couponError);

        setAvailableCoupons([]);
      } finally {
        setCouponLoading(false);
      }
    } catch (error) {
      console.error("LOAD CHECKOUT ERROR:", error);

      setError(error?.response?.data?.message || "Unable to load checkout");
    } finally {
      setLoading(false);
      setCouponLoading(false);
    }
  };

  useEffect(() => {
    void loadCheckoutData();
  }, [token]);

  const handleAddressChange = (event) => {
    const { name, value } = event.target;

    setAddressForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateAddress = async (event) => {
    event.preventDefault();

    try {
      setAddressLoading(true);
      setError("");
      setSuccess("");

      const response = await createAddress(addressForm, token);

      const newAddress = response?.address;

      if (!newAddress) {
        throw new Error("Address was not returned by the server");
      }

      setAddresses((previous) => [...previous, newAddress]);

      setSelectedAddressId(newAddress._id);

      setAddressForm(initialAddress);

      setShowAddressForm(false);

      setSuccess("Address added successfully");
    } catch (error) {
      console.error("CREATE CHECKOUT ADDRESS ERROR:", error);

      setError(error?.response?.data?.message || "Unable to add address");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleApplyCoupon = async (coupon) => {
    if (appliedCoupon) {
      setError("Only one coupon can be applied to an order");

      return;
    }

    try {
      setCouponApplying(coupon.code);
      setError("");
      setSuccess("");

      const response = await applyCoupon(coupon.code, subtotal, token);

      const discountAmount = Number(response?.discountAmount || 0);

      if (!response?.coupon || discountAmount <= 0) {
        throw new Error("This coupon could not be applied");
      }

      setAppliedCoupon({
        ...response.coupon,
        discountAmount,
      });

      setSuccess(`${response.coupon.code} applied successfully`);
    } catch (error) {
      console.error("APPLY COUPON ERROR:", error);

      setError(
        error?.response?.data?.message ||
          error.message ||
          "Unable to apply coupon",
      );
    } finally {
      setCouponApplying("");
    }
  };

  const handleRemoveCoupon = () => {
    if (!appliedCoupon) {
      return;
    }

    const code = appliedCoupon.code;

    setAppliedCoupon(null);
    setError("");
    setSuccess(`${code} removed from this order`);
  };

  const handlePlaceOrder = async () => {
    if (cart?.hasUnavailableItems) {
      setError(
        "Your cart contains unavailable or out-of-stock products. Please return to your cart and remove them before placing the order.",
      );

      return;
    }

    if (!selectedAddressId) {
      setError("Please select a delivery address");

      return;
    }

    if (!cart?.items?.length) {
      setError("Your cart is empty");

      return;
    }

    try {
      setPlacingOrder(true);
      setError("");
      setSuccess("");

      const response = await createOrder(
        selectedAddressId,
        token,
        appliedCoupon?.code || "",
      );

      const orderId = response?.order?.orderId || response?.order?._id;

      if (!orderId) {
        throw new Error("Order was created but order ID was not returned");
      }

      navigate(`/order-success/${orderId}`, {
        replace: true,
      });
    } catch (error) {
      console.error("PLACE ORDER ERROR:", error);

      setError(error?.response?.data?.message || "Unable to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] text-white">
        <div className="mx-auto max-w-[1400px] px-6 py-20 lg:px-10">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Checkout
          </p>

          <h1 className="mt-3 font-serif text-4xl">Loading checkout...</h1>
        </div>
      </div>
    );
  }

  const items = Array.isArray(cart?.items) ? cart.items : [];

  const selectedAddress = addresses.find(
    (address) => address._id === selectedAddressId,
  );

  const subtotal = Number(cart?.subtotal || 0);

  const shipping = 0;

  const discount = Number(appliedCoupon?.discountAmount || 0);

  const tax = 0;

  const total = Math.max(subtotal - discount + shipping + tax, 0);

  const hasUnavailableItems = Boolean(cart?.hasUnavailableItems);

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <header className="border-b border-[#262626] bg-[#151515]">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-10">
          <Link to="/home" className="font-serif text-lg tracking-wide">
            UrbanThread
          </Link>

          <div className="flex items-center gap-5">
            <Link
              to="/shop"
              className="text-[10px] uppercase tracking-[0.15em] text-neutral-500 hover:text-white"
            >
              Shop
            </Link>

            <Link
              to="/cart"
              className="text-[10px] uppercase tracking-[0.15em] text-neutral-500 hover:text-white"
            >
              Cart
            </Link>

            <Link
              to="/orders"
              className="text-[10px] uppercase tracking-[0.15em] text-neutral-500 hover:text-white"
            >
              Orders
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10 lg:py-14">
        <div className="border-b border-[#292929] pb-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Complete Your Purchase
          </p>

          <h1 className="mt-3 font-serif text-4xl text-[#e8e3dc]">Checkout</h1>

          <p className="mt-3 text-sm text-neutral-500">
            Review your address and order before placing your purchase.
          </p>
        </div>

        {error && (
          <div className="mt-6 border border-red-900/50 bg-red-950/20 px-5 py-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 border border-[#384038] bg-[#171b17] px-5 py-4 text-sm text-neutral-300">
            {success}
          </div>
        )}

        {hasUnavailableItems && (
          <div className="mt-6 border border-red-900/50 bg-red-950/20 px-5 py-4 text-sm text-red-400">
            <p className="font-medium text-red-300">Checkout is unavailable</p>

            <p className="mt-1 leading-6">
              One or more products in your cart are currently out of stock or
              unavailable. Return to your cart, remove those products, and then
              continue to checkout.
            </p>

            <Link
              to="/cart"
              className="mt-4 inline-flex border border-red-800/60 px-4 py-2 text-[9px] uppercase tracking-[0.15em] text-red-300 transition hover:border-red-500 hover:text-white"
            >
              Return to Cart
            </Link>
          </div>
        )}

        {items.length === 0 ? (
          <div className="mt-10 border border-dashed border-[#3a3a3a] bg-[#151515] p-12 text-center">
            <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-600">
              No Items
            </p>

            <h2 className="mt-3 font-serif text-3xl text-[#e8e3dc]">
              Your cart is empty.
            </h2>

            <Link
              to="/shop"
              className="mt-8 inline-flex bg-white px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-black"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-8">
              <section className="border border-[#2b2b2b] bg-[#171717] p-6 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                      Delivery
                    </p>

                    <h2 className="mt-2 font-serif text-2xl text-[#e8e3dc]">
                      Delivery Address
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddressForm((previous) => !previous)}
                    className="border border-[#3a3a3a] px-4 py-2 text-[9px] uppercase tracking-[0.15em] text-neutral-400 hover:border-[#666666] hover:text-white"
                  >
                    {showAddressForm ? "Close" : "Add Address"}
                  </button>
                </div>

                {showAddressForm && (
                  <form
                    onSubmit={handleCreateAddress}
                    className="mt-7 border border-[#292929] bg-[#141414] p-5"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        name="fullName"
                        value={addressForm.fullName}
                        onChange={handleAddressChange}
                        placeholder="Full Name"
                        required
                        className="border border-[#333333] bg-[#1a1a1a] px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-[#666666]"
                      />

                      <input
                        name="phone"
                        value={addressForm.phone}
                        onChange={handleAddressChange}
                        placeholder="Phone"
                        required
                        className="border border-[#333333] bg-[#1a1a1a] px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-[#666666]"
                      />

                      <input
                        name="houseName"
                        value={addressForm.houseName}
                        onChange={handleAddressChange}
                        placeholder="House / Building"
                        required
                        className="border border-[#333333] bg-[#1a1a1a] px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-[#666666]"
                      />

                      <input
                        name="street"
                        value={addressForm.street}
                        onChange={handleAddressChange}
                        placeholder="Street / Area"
                        required
                        className="border border-[#333333] bg-[#1a1a1a] px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-[#666666]"
                      />

                      <input
                        name="city"
                        value={addressForm.city}
                        onChange={handleAddressChange}
                        placeholder="City"
                        required
                        className="border border-[#333333] bg-[#1a1a1a] px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-[#666666]"
                      />

                      <input
                        name="state"
                        value={addressForm.state}
                        onChange={handleAddressChange}
                        placeholder="State"
                        required
                        className="border border-[#333333] bg-[#1a1a1a] px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-[#666666]"
                      />

                      <input
                        name="pincode"
                        value={addressForm.pincode}
                        onChange={handleAddressChange}
                        placeholder="Pincode"
                        required
                        className="border border-[#333333] bg-[#1a1a1a] px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-[#666666]"
                      />

                      <select
                        name="addressType"
                        value={addressForm.addressType}
                        onChange={handleAddressChange}
                        className="border border-[#333333] bg-[#1a1a1a] px-4 py-3 text-sm text-white outline-none"
                      >
                        <option value="Home">Home</option>

                        <option value="Work">Work</option>

                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={addressLoading}
                      className="mt-5 bg-white px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-black disabled:opacity-50"
                    >
                      {addressLoading ? "Saving..." : "Save Address"}
                    </button>
                  </form>
                )}

                {addresses.length === 0 ? (
                  <div className="mt-7 border border-dashed border-[#3a3a3a] p-7 text-center">
                    <p className="text-sm text-neutral-500">
                      No delivery addresses found.
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowAddressForm(true)}
                      className="mt-4 text-[10px] uppercase tracking-[0.15em] text-white underline underline-offset-4"
                    >
                      Add your first address
                    </button>
                  </div>
                ) : (
                  <div className="mt-7 grid gap-4">
                    {addresses.map((address) => {
                      const selected = selectedAddressId === address._id;

                      return (
                        <button
                          key={address._id}
                          type="button"
                          onClick={() => setSelectedAddressId(address._id)}
                          className={`w-full border p-5 text-left transition ${
                            selected
                              ? "border-white bg-[#202020]"
                              : "border-[#303030] bg-[#141414] hover:border-[#555555]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-5">
                            <div>
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-white">
                                  {address.fullName}
                                </span>

                                <span className="border border-[#3d3d3d] px-2 py-1 text-[8px] uppercase tracking-[0.12em] text-neutral-500">
                                  {address.addressType}
                                </span>

                                {address.isDefault && (
                                  <span className="text-[8px] uppercase tracking-[0.12em] text-neutral-400">
                                    Default
                                  </span>
                                )}
                              </div>

                              <p className="mt-3 text-sm leading-6 text-neutral-500">
                                {address.houseName}, {address.street},{" "}
                                {address.city}, {address.state} -{" "}
                                {address.pincode}
                              </p>

                              <p className="mt-2 text-xs text-neutral-600">
                                {address.phone}
                              </p>
                            </div>

                            <span
                              className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                selected ? "border-white" : "border-[#555555]"
                              }`}
                            >
                              {selected && (
                                <span className="h-2.5 w-2.5 rounded-full bg-white" />
                              )}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedAddress && (
                  <div className="mt-5 border-t border-[#292929] pt-5">
                    <p className="text-[9px] uppercase tracking-[0.15em] text-neutral-600">
                      Selected delivery address
                    </p>

                    <p className="mt-2 text-sm text-neutral-400">
                      {selectedAddress.fullName} · {selectedAddress.city}
                    </p>
                  </div>
                )}
              </section>

              <section className="border border-[#2b2b2b] bg-[#171717] p-6 sm:p-7">
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                  Payment
                </p>

                <h2 className="mt-2 font-serif text-2xl text-[#e8e3dc]">
                  Payment Method
                </h2>

                <div className="mt-6 border border-white bg-[#202020] p-5">
                  <div className="flex items-center gap-4">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white">
                      <span className="h-2.5 w-2.5 rounded-full bg-white" />
                    </span>

                    <div>
                      <p className="text-sm text-white">Cash on Delivery</p>

                      <p className="mt-1 text-xs text-neutral-500">
                        Pay when your order is delivered.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="border border-[#2b2b2b] bg-[#171717] p-6 sm:p-7">
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                  Products
                </p>

                <h2 className="mt-2 font-serif text-2xl text-[#e8e3dc]">
                  Order Items
                </h2>

                <div className="mt-7 divide-y divide-[#292929]">
                  {items.map((item) => {
                    const imageUrl = getImageUrl(item.product);

                    return (
                      <div
                        key={item._id}
                        className="flex gap-4 py-5 first:pt-0 last:pb-0"
                      >
                        <div className="h-20 w-16 shrink-0 overflow-hidden bg-[#222222]">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.product?.name || "Product"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[8px] uppercase text-neutral-600">
                              No Image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`font-serif text-lg ${
                              item.isAvailable === false
                                ? "text-neutral-600 line-through"
                                : "text-[#e8e3dc]"
                            }`}
                          >
                            {item.product?.name}
                          </p>

                          <p className="mt-1 text-[9px] uppercase tracking-[0.13em] text-neutral-600">
                            Size {item.size} · Qty {item.quantity}
                          </p>

                          {item.isAvailable === false && (
                            <p className="mt-2 text-[9px] uppercase tracking-[0.15em] text-red-400">
                              {item.availabilityMessage ||
                                "This item is currently unavailable"}
                            </p>
                          )}
                        </div>

                        <p
                          className={`text-sm ${
                            item.isAvailable === false
                              ? "text-red-400"
                              : "text-white"
                          }`}
                        >
                          {item.isAvailable === false
                            ? "Unavailable"
                            : formatPrice(item.lineTotal)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <section className="border border-[#2b2b2b] bg-[#171717] p-6 sm:p-7">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                    Offers for You
                  </p>

                  <h2 className="mt-3 font-serif text-2xl text-[#e8e3dc]">
                    Applicable Coupons
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-neutral-500">
                    These coupons are currently eligible for your cart. Only one
                    coupon can be applied to an order.
                  </p>
                </div>

                <span className="text-[9px] uppercase tracking-[0.15em] text-neutral-600">
                  {availableCoupons.length} applicable
                </span>
              </div>

              {appliedCoupon && (
                <div className="mt-6 border border-white bg-[#202020] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.15em] text-neutral-500">
                        Applied Coupon
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <span className="border border-[#555555] bg-[#1b1b1b] px-3 py-1.5 font-mono text-xs tracking-[0.12em] text-white">
                          {appliedCoupon.code}
                        </span>

                        <span className="text-sm text-[#e8e3dc]">
                          {appliedCoupon.discountType === "percentage"
                            ? `${appliedCoupon.discountValue}% OFF`
                            : `${formatPrice(appliedCoupon.discountValue)} OFF`}
                        </span>

                        <span className="text-sm text-neutral-300">
                          -{formatPrice(appliedCoupon.discountAmount)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="w-full border border-red-900/60 px-4 py-2.5 text-[9px] uppercase tracking-[0.15em] text-red-400 transition hover:border-red-500 hover:text-red-300 sm:w-auto"
                    >
                      Remove Coupon
                    </button>
                  </div>
                </div>
              )}

              {couponLoading ? (
                <div className="mt-6 border border-[#292929] bg-[#141414] px-5 py-6 text-center text-xs text-neutral-600">
                  Checking coupons applicable to your order...
                </div>
              ) : availableCoupons.length === 0 ? (
                <div className="mt-6 border border-dashed border-[#363636] bg-[#141414] px-5 py-6 text-center text-xs leading-5 text-neutral-600">
                  No coupons are currently applicable to this order.
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {availableCoupons.map((coupon) => {
                    const isApplied = appliedCoupon?.code === coupon.code;

                    const applying = couponApplying === coupon.code;

                    return (
                      <div
                        key={coupon._id}
                        className={`border p-5 transition ${
                          isApplied
                            ? "border-white bg-[#202020]"
                            : "border-[#303030] bg-[#141414]"
                        }`}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="border border-[#555555] bg-[#1b1b1b] px-3 py-1.5 font-mono text-xs tracking-[0.12em] text-white">
                                {coupon.code}
                              </span>

                              <span className="text-sm text-[#e8e3dc]">
                                {coupon.discountType === "percentage"
                                  ? `${coupon.discountValue}% OFF`
                                  : `${formatPrice(coupon.discountValue)} OFF`}
                              </span>

                              {isApplied && (
                                <span className="border border-[#555555] px-2 py-1 text-[8px] uppercase tracking-[0.12em] text-neutral-300">
                                  Applied
                                </span>
                              )}
                            </div>

                            <div className="mt-4 grid gap-x-8 gap-y-2 text-xs text-neutral-500 sm:grid-cols-2">
                              <p>
                                Minimum order:{" "}
                                {coupon.minOrderAmount > 0
                                  ? formatPrice(coupon.minOrderAmount)
                                  : "No minimum"}
                              </p>

                              {coupon.discountType === "percentage" &&
                                coupon.maxDiscountAmount != null && (
                                  <p>
                                    Maximum discount:{" "}
                                    {formatPrice(coupon.maxDiscountAmount)}
                                  </p>
                                )}

                              <p>
                                Expires:{" "}
                                {new Date(coupon.expiryDate).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleApplyCoupon(coupon)}
                            disabled={
                              Boolean(appliedCoupon) || Boolean(couponApplying)
                            }
                            className="w-full border border-white px-4 py-2.5 text-[9px] uppercase tracking-[0.15em] text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-[#3a3a3a] disabled:text-neutral-600 disabled:hover:bg-transparent disabled:hover:text-neutral-600 sm:w-auto"
                          >
                            {applying
                              ? "Applying..."
                              : isApplied
                                ? "Applied"
                                : appliedCoupon
                                  ? "One Coupon Only"
                                  : "Apply"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <aside className="h-fit border border-[#2b2b2b] bg-[#171717] p-6 sm:p-7 lg:sticky lg:top-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                Summary
              </p>

              <h2 className="mt-3 font-serif text-2xl text-[#e8e3dc]">
                Order Summary
              </h2>

              {hasUnavailableItems && (
                <div className="mb-5 border border-red-900/50 bg-red-950/20 px-4 py-3 text-[10px] leading-5 text-red-400">
                  {cart?.unavailableItemCount || 0} item
                  {(cart?.unavailableItemCount || 0) === 1 ? "" : "s"} cannot be
                  purchased right now.
                </div>
              )}

              <div className="mt-7 space-y-4 border-b border-[#292929] pb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Subtotal</span>

                  <span className="text-neutral-300">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Discount</span>

                  <span className="text-neutral-300">
                    {discount > 0 ? `-${formatPrice(discount)}` : "—"}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Shipping</span>

                  <span className="text-neutral-300">
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Tax</span>

                  <span className="text-neutral-300">
                    {tax === 0 ? "—" : formatPrice(tax)}
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between gap-4 py-6">
                <span className="text-[10px] uppercase tracking-[0.15em] text-neutral-500">
                  Final Price
                </span>

                <span className="text-2xl text-white">
                  {formatPrice(total)}
                </span>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={
                  placingOrder || !selectedAddressId || hasUnavailableItems
                }
                className="flex w-full items-center justify-center bg-white px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.17em] text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {placingOrder
                  ? "Placing Order..."
                  : hasUnavailableItems
                    ? "Remove Unavailable Items"
                    : "Place Order"}
              </button>

              <Link
                to="/cart"
                className="mt-4 flex w-full items-center justify-center border border-[#3a3a3a] px-5 py-4 text-[10px] uppercase tracking-[0.17em] text-neutral-400 hover:border-[#666666] hover:text-white"
              >
                Back to Cart
              </Link>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default Checkout;
