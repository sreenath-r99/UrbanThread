// frontend/src/pages/user/Wishlist.jsx

import { useContext, useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";

import {
  getWishlist,
  removeFromWishlist,
} from "../../services/wishlistService";

import { addToCart } from "../../services/cartService";

const Wishlist = () => {
  const navigate = useNavigate();

  const { token } = useContext(AuthContext);

  const [wishlist, setWishlist] = useState(null);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState("");

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const fetchWishlist = async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);

      const response = await getWishlist(token);

      setWishlist(
        response?.wishlist || {
          items: [],
          itemCount: 0,
        },
      );
    } catch (error) {
      console.error("FETCH WISHLIST ERROR:", error);

      setError(error?.response?.data?.message || "Unable to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/", {
        replace: true,
      });

      return;
    }

    let isMounted = true;

    const loadWishlist = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getWishlist(token);

        if (!isMounted) {
          return;
        }

        setWishlist(
          response?.wishlist || {
            items: [],
            itemCount: 0,
          },
        );
      } catch (error) {
        console.error("FETCH WISHLIST ERROR:", error);

        if (isMounted) {
          setError(error?.response?.data?.message || "Unable to load wishlist");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadWishlist();

    return () => {
      isMounted = false;
    };
  }, [token, navigate]);

  const handleRemove = async (productId) => {
    try {
      setActionLoading(`remove-${productId}`);

      setError("");
      setSuccess("");

      const response = await removeFromWishlist(productId, token);

      setWishlist(
        response?.wishlist || {
          items: [],
          itemCount: 0,
        },
      );

      setSuccess("Product removed from wishlist");
    } catch (error) {
      console.error("REMOVE WISHLIST ERROR:", error);

      setError(error?.response?.data?.message || "Unable to remove product");
    } finally {
      setActionLoading("");
    }
  };

  const handleAddToCart = async (item) => {
    const product = item.product;

    if (!product) {
      return;
    }

    const productId = product._id;

    const sizes = Array.isArray(product.sizes) ? product.sizes : [];

    const availableSize = sizes.find((size) => size.stock > 0);

    if (sizes.length > 0 && !availableSize) {
      setError("This product is currently out of stock");

      return;
    }

    try {
      setActionLoading(`cart-${productId}`);

      setError("");
      setSuccess("");

      const size = availableSize?.size || null;

      await addToCart(productId, size, 1, token);

      /*
       * The backend also removes the product
       * from Wishlist after successful cart
       * insertion.
       *
       * Refreshing the wishlist keeps the
       * frontend state synchronized.
       */
      await fetchWishlist();

      setSuccess(`${product.name} moved to cart`);
    } catch (error) {
      console.error("WISHLIST ADD TO CART ERROR:", error);

      setError(
        error?.response?.data?.message || "Unable to add product to cart",
      );
    } finally {
      setActionLoading("");
    }
  };

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

  const getPrice = (product) => {
    if (
      product?.discountPrice !== null &&
      product?.discountPrice !== undefined &&
      product.discountPrice < product.price
    ) {
      return product.discountPrice;
    }

    return product?.price || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] text-white">
        <header className="border-b border-[#262626] bg-[#151515]">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-10">
            <Link to="/home" className="font-serif text-lg tracking-wide">
              UrbanThread
            </Link>

            <Link
              to="/shop"
              className="text-[10px] uppercase tracking-[0.2em] text-neutral-400"
            >
              Shop
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] px-6 py-12 lg:px-10">
          <div className="animate-pulse">
            <div className="h-10 w-64 bg-[#1d1d1d]" />

            <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item}>
                  <div className="aspect-[4/5] bg-[#1b1b1b]" />
                  <div className="mt-4 h-3 w-3/4 bg-[#1d1d1d]" />
                  <div className="mt-2 h-3 w-1/3 bg-[#1d1d1d]" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const items = wishlist?.items || [];

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <header className="border-b border-[#262626] bg-[#151515]">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-10">
          <Link
            to="/home"
            className="font-serif text-lg tracking-wide text-white"
          >
            UrbanThread
          </Link>

          <nav className="flex items-center gap-5 text-[10px] uppercase tracking-[0.18em] text-neutral-500">
            <Link to="/shop" className="transition hover:text-white">
              Shop
            </Link>

            <Link to="/cart" className="transition hover:text-white">
              Cart
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10 lg:py-14">
        <div className="flex flex-col justify-between gap-5 border-b border-[#292929] pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-[9px] uppercase tracking-[0.25em] text-neutral-600">
              Saved pieces
            </p>

            <h1 className="mt-3 font-serif text-4xl text-[#eee7dc] md:text-5xl">
              My Wishlist
            </h1>

            <p className="mt-4 text-sm text-neutral-500">
              {wishlist?.itemCount || 0}{" "}
              {wishlist?.itemCount === 1 ? "item" : "items"} saved
            </p>
          </div>

          <Link
            to="/shop"
            className="w-fit border-b border-white/30 pb-2 text-[9px] uppercase tracking-[0.2em] text-neutral-400 transition hover:border-white hover:text-white"
          >
            Continue Shopping
          </Link>
        </div>

        {error && (
          <div className="mt-6 border border-red-900/50 bg-red-950/20 px-4 py-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 border border-emerald-900/50 bg-emerald-950/20 px-4 py-3 text-xs text-emerald-400">
            {success}
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <div className="text-5xl text-neutral-700">♡</div>

            <h2 className="mt-6 font-serif text-3xl text-neutral-300">
              Your wishlist is empty
            </h2>

            <p className="mt-3 max-w-md text-sm leading-7 text-neutral-600">
              Save pieces you love and come back to them whenever you are ready.
            </p>

            <Link
              to="/shop"
              className="mt-7 bg-[#e8e0d5] px-7 py-3 text-[9px] uppercase tracking-[0.2em] text-[#151515] transition hover:bg-white"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => {
              const product = item.product;

              if (!product) {
                return null;
              }

              const image = getImageUrl(product);

              const price = getPrice(product);

              const hasDiscount =
                product.discountPrice !== null &&
                product.discountPrice !== undefined &&
                product.discountPrice < product.price;

              const cartLoading = actionLoading === `cart-${product._id}`;

              const removeLoading = actionLoading === `remove-${product._id}`;

              return (
                <article key={item._id || product._id} className="group">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#181818]">
                    <Link to={`/products/${product._id}`}>
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[9px] uppercase tracking-[0.15em] text-neutral-700">
                          No image
                        </div>
                      )}
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleRemove(product._id)}
                      disabled={removeLoading}
                      aria-label="Remove from wishlist"
                      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center border border-white/10 bg-[#111111]/85 text-lg text-white backdrop-blur-sm transition hover:border-white/30 disabled:opacity-50"
                    >
                      {removeLoading ? "..." : "♥"}
                    </button>
                  </div>

                  <div className="mt-4">
                    <p className="text-[9px] uppercase tracking-[0.16em] text-neutral-600">
                      {product.category?.name || "Collection"}
                    </p>

                    <Link
                      to={`/products/${product._id}`}
                      className="mt-2 block truncate text-sm text-neutral-300 transition hover:text-white"
                    >
                      {product.name}
                    </Link>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-neutral-200">
                        ₹{Number(price).toLocaleString("en-IN")}
                      </span>

                      {hasDiscount && (
                        <span className="text-[10px] text-neutral-700 line-through">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      disabled={
                        cartLoading ||
                        product.isActive === false ||
                        product.isDeleted === true
                      }
                      className="mt-4 w-full border border-[#393939] py-3 text-[9px] uppercase tracking-[0.18em] text-neutral-400 transition hover:border-[#777777] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {cartLoading ? "Adding..." : "Move to Cart"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-[#262626] bg-[#151515]">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div>
            <div className="font-serif text-base text-neutral-300">
              UrbanThread
            </div>

            <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-neutral-600">
              © 2026 UrbanThread. All rights reserved.
            </p>
          </div>

          <Link
            to="/shop"
            className="text-[9px] uppercase tracking-[0.15em] text-neutral-600 transition hover:text-white"
          >
            Shop
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Wishlist;
