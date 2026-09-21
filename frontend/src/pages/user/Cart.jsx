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
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../../services/cartService";

const Cart = () => {
  const { token } = useContext(AuthContext);

  const navigate = useNavigate();

  const [cart, setCart] = useState({
    items: [],
    itemCount: 0,
    subtotal: 0,
  });

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState("");

  const [error, setError] = useState("");

  const [success, setSuccess] =
    useState("");

  // ==========================
  // FETCH CART
  // ==========================

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getCart(token);

      setCart(
        response.cart || {
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
        error.response?.data?.message ||
          "Unable to load your cart"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // INITIAL LOAD
  // ==========================

  useEffect(() => {
    if (token) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [token]);

  // ==========================
  // UPDATE QUANTITY
  // ==========================

  const handleQuantityChange = async (
    item,
    newQuantity
  ) => {
    if (newQuantity < 1) {
      return;
    }

    try {
      setActionLoading(item._id);
      setError("");
      setSuccess("");

      const response =
        await updateCartItem(
          item._id,
          newQuantity,
          token
        );

      setCart(response.cart);

      setSuccess(
        "Cart updated successfully"
      );
    } catch (error) {
      console.error(
        "UPDATE CART ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to update cart"
      );
    } finally {
      setActionLoading("");
    }
  };

  // ==========================
  // REMOVE ITEM
  // ==========================

  const handleRemove = async (
    itemId
  ) => {
    try {
      setActionLoading(itemId);
      setError("");
      setSuccess("");

      const response =
        await removeFromCart(
          itemId,
          token
        );

      setCart(response.cart);

      setSuccess(
        "Product removed from cart"
      );
    } catch (error) {
      console.error(
        "REMOVE CART ITEM ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to remove product"
      );
    } finally {
      setActionLoading("");
    }
  };

  // ==========================
  // CLEAR CART
  // ==========================

  const handleClearCart = async () => {
    if (!cart.items.length) {
      return;
    }

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

      setCart(response.cart);

      setSuccess(
        "Cart cleared successfully"
      );
    } catch (error) {
      console.error(
        "CLEAR CART ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to clear cart"
      );
    } finally {
      setActionLoading("");
    }
  };

  // ==========================
  // FORMAT PRICE
  // ==========================

  const formatPrice = (price) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(price || 0);
  };

  // ==========================
  // LOADING
  // ==========================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] px-6 py-16 text-white md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
            Shopping Cart
          </p>

          <h1 className="mt-3 font-serif text-4xl text-[#e8e3dc]">
            Your Cart
          </h1>

          <div className="mt-12 border border-[#292929] bg-[#181818] p-10 text-center">
            <p className="text-sm text-neutral-500">
              Loading your cart...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================
  // EMPTY CART
  // ==========================

  if (!cart.items?.length) {
    return (
      <div className="min-h-screen bg-[#111111] px-6 py-16 text-white md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
            Shopping Cart
          </p>

          <h1 className="mt-3 font-serif text-4xl text-[#e8e3dc]">
            Your Cart
          </h1>

          {error && (
            <div className="mt-8 border border-red-900/50 bg-red-950/20 px-5 py-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="mt-12 border border-dashed border-[#363636] bg-[#151515] px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#353535] text-2xl text-neutral-500">
              🛒
            </div>

            <h2 className="mt-6 font-serif text-2xl text-[#e8e3dc]">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-neutral-500">
              You haven't added any products
              to your cart yet.
            </p>

            <Link
              to="/shop"
              className="mt-8 inline-flex bg-[#e3dbd0] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#292724] transition hover:bg-[#f0e8dd]"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================
  // CART PAGE
  // ==========================

  return (
    <div className="min-h-screen bg-[#111111] px-6 py-12 text-white md:px-10 lg:px-14">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 border-b border-[#292929] pb-7 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
              Shopping Cart
            </p>

            <h1 className="mt-3 font-serif text-4xl text-[#e8e3dc]">
              Your Cart
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              {cart.itemCount}{" "}
              {cart.itemCount === 1
                ? "item"
                : "items"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearCart}
            disabled={
              actionLoading === "clear"
            }
            className="self-start border border-[#353535] px-5 py-2.5 text-[9px] uppercase tracking-[0.18em] text-neutral-400 transition hover:border-red-500/40 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50 md:self-auto"
          >
            {actionLoading === "clear"
              ? "Clearing..."
              : "Clear Cart"}
          </button>
        </div>

        {/* SUCCESS */}

        {success && (
          <div className="mt-6 border border-green-900/40 bg-green-950/20 px-5 py-3 text-sm text-green-400">
            {success}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mt-6 border border-red-900/50 bg-red-950/20 px-5 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* CONTENT */}

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">

          {/* CART ITEMS */}

          <section>
            <div className="border-y border-[#292929]">

              {cart.items.map(
                (item) => {
                  const product =
                    item.product;

                  const image =
                    product?.images?.[0]
                      ?.url;

                  const isLoading =
                    actionLoading ===
                    item._id;

                  return (
                    <div
                      key={item._id}
                      className="flex flex-col gap-5 border-b border-[#292929] py-7 last:border-b-0 sm:flex-row"
                    >

                      {/* IMAGE */}

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/products/${product._id}`
                          )
                        }
                        className="h-40 w-full shrink-0 overflow-hidden bg-[#1b1b1b] sm:h-40 sm:w-32"
                      >
                        {image ? (
                          <img
                            src={image}
                            alt={
                              product.name
                            }
                            className="h-full w-full object-cover transition duration-500 hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-neutral-600">
                            No Image
                          </div>
                        )}
                      </button>

                      {/* DETAILS */}

                      <div className="flex min-w-0 flex-1 flex-col">

                        <div className="flex flex-col justify-between gap-3 sm:flex-row">
                          <div>
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/products/${product._id}`
                                )
                              }
                              className="text-left font-serif text-xl text-[#e8e3dc] transition hover:text-white"
                            >
                              {product.name}
                            </button>

                            <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                              Size:{" "}
                              <span className="text-neutral-300">
                                {item.size}
                              </span>
                            </p>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-base text-[#e8e3dc]">
                              {formatPrice(
                                item.price
                              )}
                            </p>

                            <p className="mt-1 text-[10px] text-neutral-600">
                              each
                            </p>
                          </div>
                        </div>

                        {/* QUANTITY */}

                        <div className="mt-auto flex flex-wrap items-center justify-between gap-5 pt-7">

                          <div className="flex items-center border border-[#353535]">
                            <button
                              type="button"
                              disabled={
                                isLoading ||
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
                              className="flex h-9 w-9 items-center justify-center text-neutral-400 transition hover:bg-[#202020] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              −
                            </button>

                            <span className="flex h-9 min-w-10 items-center justify-center border-x border-[#353535] text-xs text-neutral-300">
                              {isLoading
                                ? "..."
                                : item.quantity}
                            </span>

                            <button
                              type="button"
                              disabled={
                                isLoading
                              }
                              onClick={() =>
                                handleQuantityChange(
                                  item,
                                  item.quantity +
                                    1
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center text-neutral-400 transition hover:bg-[#202020] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              +
                            </button>
                          </div>

                          <div className="flex items-center gap-5">
                            <p className="text-sm text-[#e8e3dc]">
                              {formatPrice(
                                item.lineTotal
                              )}
                            </p>

                            <button
                              type="button"
                              disabled={
                                isLoading
                              }
                              onClick={() =>
                                handleRemove(
                                  item._id
                                )
                              }
                              className="text-[9px] uppercase tracking-[0.15em] text-neutral-600 transition hover:text-red-400 disabled:opacity-40"
                            >
                              Remove
                            </button>
                          </div>

                        </div>
                      </div>
                    </div>
                  );
                }
              )}

            </div>

            {/* CONTINUE SHOPPING */}

            <Link
              to="/shop"
              className="mt-7 inline-flex items-center gap-3 text-[9px] uppercase tracking-[0.18em] text-neutral-500 transition hover:text-white"
            >
              <span className="text-sm">
                ←
              </span>
              Continue Shopping
            </Link>
          </section>

          {/* SUMMARY */}

          <aside className="h-fit border border-[#292929] bg-[#181818] p-7 lg:sticky lg:top-8">

            <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">
              Order Summary
            </p>

            <h2 className="mt-3 font-serif text-2xl text-[#e8e3dc]">
              Cart Total
            </h2>

            <div className="mt-8 space-y-4 border-b border-[#292929] pb-6">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">
                  Items
                </span>

                <span className="text-neutral-300">
                  {cart.itemCount}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">
                  Subtotal
                </span>

                <span className="text-neutral-300">
                  {formatPrice(
                    cart.subtotal
                  )}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">
                  Shipping
                </span>

                <span className="text-neutral-400">
                  Calculated at checkout
                </span>
              </div>
            </div>

            <div className="flex items-end justify-between pt-6">
              <span className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                Total
              </span>

              <span className="font-serif text-2xl text-[#e8e3dc]">
                {formatPrice(
                  cart.subtotal
                )}
              </span>
            </div>

            <button
              type="button"
              disabled
              className="mt-8 w-full bg-[#e3dbd0] py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#292724] opacity-60"
            >
              Proceed to Checkout
            </button>

            <p className="mt-4 text-center text-[9px] leading-5 text-neutral-600">
              Checkout and payment will be
              connected in the next stage.
            </p>

          </aside>
        </div>
      </div>
    </div>
  );
};

export default Cart;