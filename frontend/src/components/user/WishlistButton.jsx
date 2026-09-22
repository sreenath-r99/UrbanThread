// frontend/src/components/user/WishlistButton.jsx

import {
  useEffect,
  useState,
} from "react";

import {
  addToWishlist,
  checkWishlist,
  removeFromWishlist,
} from "../../services/wishlistService";

import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const WishlistButton = ({
  productId,
  className = "",
  showLabel = false,
  onWishlistChange,
}) => {
  const {
    token,
  } = useContext(AuthContext);

  const [isWishlisted, setIsWishlisted] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [checking, setChecking] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    const loadWishlistStatus =
      async () => {
        if (!token || !productId) {
          if (mounted) {
            setChecking(false);
          }

          return;
        }

        try {
          setChecking(true);

          const response =
            await checkWishlist(
              productId,
              token
            );

          if (!mounted) {
            return;
          }

          setIsWishlisted(
            Boolean(
              response?.isWishlisted
            )
          );
        } catch (error) {
          console.error(
            "CHECK WISHLIST ERROR:",
            error
          );

          if (mounted) {
            setIsWishlisted(false);
          }
        } finally {
          if (mounted) {
            setChecking(false);
          }
        }
      };

    loadWishlistStatus();

    return () => {
      mounted = false;
    };
  }, [productId, token]);

  const handleToggle = async (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!token) {
      setError(
        "Please login to use wishlist"
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      if (isWishlisted) {
        await removeFromWishlist(
          productId,
          token
        );

        setIsWishlisted(false);

        onWishlistChange?.(
          productId,
          false
        );
      } else {
        await addToWishlist(
          productId,
          token
        );

        setIsWishlisted(true);

        onWishlistChange?.(
          productId,
          true
        );
      }
    } catch (error) {
      console.error(
        "WISHLIST TOGGLE ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Unable to update wishlist"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        disabled={
          loading || checking
        }
        aria-label={
          isWishlisted
            ? "Remove from wishlist"
            : "Add to wishlist"
        }
        title={
          isWishlisted
            ? "Remove from wishlist"
            : "Add to wishlist"
        }
        className={
          className ||
          "flex h-11 w-11 items-center justify-center border border-[#363636] bg-[#151515]/90 text-xl text-neutral-300 backdrop-blur-sm transition hover:border-[#666666] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        }
      >
        {loading || checking
          ? "..."
          : isWishlisted
          ? "♥"
          : "♡"}

        {showLabel && (
          <span className="ml-2 text-[9px] uppercase tracking-[0.15em]">
            {isWishlisted
              ? "Wishlisted"
              : "Wishlist"}
          </span>
        )}
      </button>

      {error && (
        <span className="absolute right-0 top-full z-50 mt-2 w-48 border border-red-900/50 bg-[#181818] px-3 py-2 text-[9px] leading-4 text-red-400">
          {error}
        </span>
      )}
    </div>
  );
};

export default WishlistButton;