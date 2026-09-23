import {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";

import {
  clearCart,
  getCart,
  removeFromCart,
  updateCartItem,
} from "../../services/cartService";

const Cart = () => {
  const navigate = useNavigate();

  const { token } =
    useContext(AuthContext);

  const [cart, setCart] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const fetchCart = async () => {
    if (!token) {
      navigate("/", {
        replace: true,
      });

      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await getCart(token);

      setCart(
        response?.cart || {
          items: [],
          itemCount: 0,
          subtotal: 0,
        }
      );
    } catch (error) {
      console.error(
        "FETCH CART ERROR:",
        error
      );

      setError(
        error?.response?.data
          ?.message ||
          "Unable to load cart"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCart();
  }, [token]);

  const formatPrice = (value) =>
    `₹${Number(
      value || 0
    ).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  const getImageUrl = (product) => {
    const image =
      product?.images?.[0];

    if (!image) {
      return "";
    }

    if (
      typeof image === "string"
    ) {
      return image;
    }

    return image.url || "";
  };

  const handleQuantityChange =
    async (
      item,
      nextQuantity
    ) => {
      if (nextQuantity < 1) {
        return;
      }

      try {
        setActionLoading(
          item._id
        );

        setError("");
        setSuccess("");

        const response =
          await updateCartItem(
            item._id,
            nextQuantity,
            token
          );

        setCart(
          response?.cart || {
            items: [],
            itemCount: 0,
            subtotal: 0,
          }
        );
      } catch (error) {
        console.error(
          "UPDATE CART ERROR:",
          error
        );

        setError(
          error?.response?.data
            ?.message ||
            "Unable to update quantity"
        );
      } finally {
        setActionLoading("");
      }
    };

  const handleRemove =
    async (itemId) => {
      try {
        setActionLoading(
          `remove-${itemId}`
        );

        setError("");
        setSuccess("");

        const response =
          await removeFromCart(
            itemId,
            token
          );

        setCart(
          response?.cart || {
            items: [],
            itemCount: 0,
            subtotal: 0,
          }
        );

        setSuccess(
          "Product removed from cart"
        );
      } catch (error) {
        console.error(
          "REMOVE CART ERROR:",
          error
        );

        setError(
          error?.response?.data
            ?.message ||
            "Unable to remove product"
        );
      } finally {
        setActionLoading("");
      }
    };

  const handleClearCart =
    async () => {
      const confirmed =
        window.confirm(
          "Are you sure you want to clear your cart?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading("clear");

        setError("");
        setSuccess("");

        const response =
          await clearCart(token);

        setCart(
          response?.cart || {
            items: [],
            itemCount: 0,
            subtotal: 0,
          }
        );

        setSuccess(
          "Cart cleared successfully"
        );
      } catch (error) {
        console.error(
          "CLEAR CART ERROR:",
          error
        );

        setError(
          error?.response?.data
            ?.message ||
            "Unable to clear cart"
        );
      } finally {
        setActionLoading("");
      }
    };

  const handleCheckout =
    () => {
      if (
        !cart?.items?.length
      ) {
        setError(
          "Your cart is empty"
        );

        return;
      }

      if (
        cart?.hasUnavailableItems
      ) {
        setError(
          "Please remove unavailable or out-of-stock products before checkout"
        );

        return;
      }

      navigate("/checkout");
    };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] text-white">
        <div className="mx-auto max-w-[1400px] px-6 py-20 lg:px-10">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Shopping Cart
          </p>

          <h1 className="mt-3 font-serif text-4xl">
            Loading cart...
          </h1>
        </div>
      </div>
    );
  }

  const items =
    Array.isArray(cart?.items)
      ? cart.items
      : [];

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <header className="border-b border-[#262626] bg-[#151515]">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-10">
          <Link
            to="/home"
            className="font-serif text-lg tracking-wide"
          >
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
              to="/wishlist"
              className="text-[10px] uppercase tracking-[0.15em] text-neutral-500 hover:text-white"
            >
              Wishlist
            </Link>

            <Link
              to="/orders"
              className="text-[10px] uppercase tracking-[0.15em] text-neutral-500 hover:text-white"
            >
              Orders
            </Link>

            <Link
              to="/profile"
              className="text-[10px] uppercase tracking-[0.15em] text-neutral-500 hover:text-white"
            >
              Account
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10 lg:py-14">
        <div className="flex flex-col justify-between gap-5 border-b border-[#292929] pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              Your Selection
            </p>

            <h1 className="mt-3 font-serif text-4xl text-[#e8e3dc]">
              Shopping Cart
            </h1>

            <p className="mt-3 text-sm text-neutral-500">
              {cart?.itemCount || 0}{" "}
              item
              {(cart?.itemCount ||
                0) === 1
                ? ""
                : "s"}{" "}
              in your cart.
            </p>
          </div>

          {items.length >
            0 && (
            <button
              type="button"
              onClick={
                handleClearCart
              }
              disabled={
                actionLoading ===
                "clear"
              }
              className="text-[10px] uppercase tracking-[0.15em] text-neutral-500 underline underline-offset-4 hover:text-white disabled:opacity-40"
            >
              {actionLoading ===
              "clear"
                ? "Clearing..."
                : "Clear Cart"}
            </button>
          )}
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

        {items.length ===
        0 ? (
          <div className="mt-10 border border-dashed border-[#3a3a3a] bg-[#151515] p-12 text-center">
            <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-600">
              Cart Empty
            </p>

            <h2 className="mt-3 font-serif text-3xl text-[#e8e3dc]">
              Your cart is waiting for something new.
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-neutral-500">
              Explore the latest UrbanThread collection and add products to your cart.
            </p>

            <Link
              to="/shop"
              className="mt-8 inline-flex bg-white px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-black hover:bg-neutral-200"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
            <section className="border border-[#2b2b2b] bg-[#171717]">
              {items.map(
                (item) => {
                  const product =
                    item.product;

                  const imageUrl =
                    getImageUrl(
                      product
                    );

                  const itemLoading =
                    actionLoading ===
                      item._id ||
                    actionLoading ===
                      `remove-${item._id}`;

                  const itemUnavailable =
                    item.isAvailable === false;

                  return (
                    <div
                      key={
                        item._id
                      }
                      className={`border-b border-[#292929] p-5 last:border-b-0 sm:p-7 ${
                        itemUnavailable
                          ? "bg-[#1b1515]"
                          : ""
                      }`}
                    >
                      <div className="flex gap-5">
                        <Link
                          to={`/products/${product?._id}`}
                          className="h-32 w-24 shrink-0 overflow-hidden bg-[#222222] sm:h-40 sm:w-32"
                        >
                          {imageUrl ? (
                            <img
                              src={
                                imageUrl
                              }
                              alt={
                                product?.name ||
                                "Product"
                              }
                              className="h-full w-full object-cover transition duration-300 hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[9px] uppercase text-neutral-600">
                              No Image
                            </div>
                          )}
                        </Link>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col justify-between gap-4 sm:flex-row">
                            <div>
                              <Link
                                to={`/products/${product?._id}`}
                                className="font-serif text-xl text-[#e8e3dc] hover:text-white"
                              >
                                {product?.name ||
                                  "Product"}
                              </Link>

                              <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-neutral-500">
                                Size{" "}
                                {
                                  item.size
                                }
                              </p>

                              {itemUnavailable && (
                                <p className="mt-2 text-[9px] uppercase tracking-[0.15em] text-red-400">
                                  {item.availabilityMessage ||
                                    "This item is currently unavailable"}
                                </p>
                              )}
                            </div>

                            <p
                              className={`text-lg ${
                                itemUnavailable
                                  ? "text-neutral-600 line-through"
                                  : "text-white"
                              }`}
                            >
                              {formatPrice(
                                item.price
                              )}
                            </p>
                          </div>

                          <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                            <div className="flex items-center border border-[#3a3a3a]">
                              <button
                                type="button"
                                disabled={
                                  itemLoading ||
                                  itemUnavailable ||
                                  item.quantity <=
                                    1
                                }
                                onClick={() =>
                                  handleQuantityChange(
                                    item,
                                    item.quantity -
                                      1
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center text-neutral-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                −
                              </button>

                              <span className="flex h-9 min-w-10 items-center justify-center border-x border-[#3a3a3a] text-sm">
                                {
                                  item.quantity
                                }
                              </span>

                              <button
                                type="button"
                                disabled={
                                  itemLoading ||
                                  itemUnavailable
                                }
                                onClick={() =>
                                  handleQuantityChange(
                                    item,
                                    item.quantity +
                                      1
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center text-neutral-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                +
                              </button>
                            </div>

                            <div className="flex items-center justify-between gap-8 sm:justify-end">
                              <div>
                                <p className="text-[9px] uppercase tracking-[0.15em] text-neutral-600">
                                  {itemUnavailable
                                    ? "Status"
                                    : "Item Total"}
                                </p>

                                <p
                                  className={`mt-1 text-sm ${
                                    itemUnavailable
                                      ? "text-red-400"
                                      : "text-white"
                                  }`}
                                >
                                  {itemUnavailable
                                    ? "Unavailable"
                                    : formatPrice(
                                        item.lineTotal
                                      )}
                                </p>
                              </div>

                              <button
                                type="button"
                                disabled={
                                  itemLoading
                                }
                                onClick={() =>
                                  handleRemove(
                                    item._id
                                  )
                                }
                                className="text-[9px] uppercase tracking-[0.15em] text-neutral-500 underline underline-offset-4 hover:text-white disabled:opacity-40"
                              >
                                {actionLoading ===
                                `remove-${item._id}`
                                  ? "Removing..."
                                  : "Remove"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </section>

            <aside className="h-fit border border-[#2b2b2b] bg-[#171717] p-6 sm:p-7">
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                Order Summary
              </p>

              <h2 className="mt-3 font-serif text-2xl text-[#e8e3dc]">
                Summary
              </h2>

              <div className="mt-7 space-y-4 border-b border-[#292929] pb-6">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-neutral-500">
                    Items
                  </span>

                  <span className="text-neutral-300">
                    {cart?.itemCount ||
                      0}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-neutral-500">
                    Subtotal
                  </span>

                  <span className="text-neutral-300">
                    {formatPrice(
                      cart?.subtotal
                    )}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-neutral-500">
                    Shipping
                  </span>

                  <span className="text-neutral-300">
                    Free
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between gap-4 py-6">
                <span className="text-[10px] uppercase tracking-[0.15em] text-neutral-500">
                  Total
                </span>

                <span className="text-2xl text-white">
                  {formatPrice(
                    cart?.subtotal
                  )}
                </span>
              </div>

              {cart?.hasUnavailableItems && (
                <div className="mb-4 border border-red-900/50 bg-red-950/20 px-4 py-3 text-[10px] leading-5 text-red-400">
                  Remove unavailable or out-of-stock products before proceeding to checkout.
                </div>
              )}

              <button
                type="button"
                onClick={
                  handleCheckout
                }
                disabled={
                  cart?.hasUnavailableItems ||
                  !cart?.items?.length
                }
                className="flex w-full items-center justify-center bg-white px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.17em] text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {cart?.hasUnavailableItems
                  ? "Checkout Unavailable"
                  : "Proceed to Checkout"}
              </button>

              <Link
                to="/shop"
                className="mt-4 flex w-full items-center justify-center border border-[#3a3a3a] px-5 py-4 text-[10px] uppercase tracking-[0.17em] text-neutral-400 transition hover:border-[#666666] hover:text-white"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;