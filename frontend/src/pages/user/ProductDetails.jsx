import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";

import {
  getProductDetails,
  getRelatedProducts,
} from "../../services/productDetailsService";

import { addToCart } from "../../services/cartService";

import WishlistButton from "../../components/user/WishlistButton";

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const { token } = useContext(AuthContext);

  // ============================================================
  // PRODUCT STATE
  // ============================================================

  const [product, setProduct] =
    useState(null);

  const [relatedProducts, setRelatedProducts] =
    useState([]);

  const [selectedImage, setSelectedImage] =
    useState(0);

  const [selectedSize, setSelectedSize] =
    useState("");

  const [quantity, setQuantity] =
    useState(1);

  // ============================================================
  // ZOOM STATE
  // ============================================================

  const [zoomOpen, setZoomOpen] =
    useState(false);

  const [zoomLevel, setZoomLevel] =
    useState(1);

  const [panPosition, setPanPosition] =
    useState({
      x: 0,
      y: 0,
    });

  const [isDragging, setIsDragging] =
    useState(false);

  const [dragStart, setDragStart] =
    useState({
      x: 0,
      y: 0,
    });

  // ============================================================
  // LOADING / ERROR STATE
  // ============================================================

  const [loading, setLoading] =
    useState(Boolean(productId));

  const [relatedLoading, setRelatedLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ============================================================
  // CART STATE
  // ============================================================

  const [cartLoading, setCartLoading] =
    useState(false);

  const [cartMessage, setCartMessage] =
    useState("");

  const [cartError, setCartError] =
    useState("");

  // ============================================================
  // ZOOM SETTINGS
  // ============================================================

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 3;
  const ZOOM_STEP = 0.25;

  // ============================================================
  // FETCH PRODUCT
  // ============================================================

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getProductDetails(
            productId
          );

        if (!isMounted) {
          return;
        }

        if (
          !response?.success ||
          !response?.product
        ) {
          throw new Error(
            "Product is unavailable or no longer exists"
          );
        }

        setProduct(response.product);

        setSelectedImage(0);
        setSelectedSize("");
        setQuantity(1);

        setCartMessage("");
        setCartError("");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setProduct(null);

        setError(
          error.response?.data?.message ||
            error.message ||
            "Unable to load product details"
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (productId) {
      void fetchProduct();
    }

    return () => {
      isMounted = false;
    };
  }, [productId]);

  // ============================================================
  // FETCH RELATED PRODUCTS
  // ============================================================

  useEffect(() => {
    let isMounted = true;

    const fetchRelatedProducts =
      async () => {
        if (!productId) {
          return;
        }

        try {
          setRelatedLoading(true);

          const response =
            await getRelatedProducts(
              productId
            );

          if (!isMounted) {
            return;
          }

          setRelatedProducts(
            response?.success &&
              Array.isArray(
                response.products
              )
              ? response.products
              : []
          );
        } catch (error) {
          console.error(
            "RELATED PRODUCTS ERROR:",
            error
          );

          if (isMounted) {
            setRelatedProducts([]);
          }
        } finally {
          if (isMounted) {
            setRelatedLoading(false);
          }
        }
      };

    fetchRelatedProducts();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  // ============================================================
  // HELPERS
  // ============================================================

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (typeof image === "string") {
      return image;
    }

    return image.url || "";
  };

  // ============================================================
  // PRODUCT IMAGES
  // ============================================================

  const images = Array.isArray(
    product?.images
  )
    ? product.images
        .map(getImageUrl)
        .filter(Boolean)
    : [];

  const activeImage =
    images[selectedImage] || "";

  // ============================================================
  // PRICE
  // ============================================================

  const currentPrice =
    product?.discountPrice !== null &&
    product?.discountPrice !== undefined &&
    product.discountPrice <
      product.price
      ? product.discountPrice
      : product?.price;

  // ============================================================
  // DISCOUNT
  // ============================================================

  const discountPercentage =
    useMemo(() => {
      if (
        !product?.discountPrice ||
        !product?.price ||
        product.discountPrice >=
          product.price
      ) {
        return 0;
      }

      return Math.round(
        ((product.price -
          product.discountPrice) /
          product.price) *
          100
      );
    }, [product]);

  // ============================================================
  // STOCK
  // ============================================================

  const totalAvailableStock =
    useMemo(() => {
      if (!product) {
        return 0;
      }

      if (
        Array.isArray(product.sizes) &&
        product.sizes.length > 0
      ) {
        return product.sizes.reduce(
          (total, item) =>
            total + (Number(item.stock) || 0),
          0
        );
      }

      return Number(product.stock) || 0;
    }, [product]);

  const stockStatus =
    useMemo(() => {
      if (!product) {
        return {
          label: "",
          className: "",
        };
      }

      if (totalAvailableStock <= 0) {
        return {
          label: "Out of stock",
          className:
            "text-red-400",
        };
      }

      if (totalAvailableStock <= 5) {
        return {
          label: `Only ${totalAvailableStock} left`,
          className:
            "text-amber-400",
        };
      }

      return {
        label: "In stock",
        className:
          "text-emerald-400",
      };
    }, [product, totalAvailableStock]);

  const isOutOfStock =
    totalAvailableStock <= 0;

  // ============================================================
  // SIZE STOCK
  // ============================================================

  const selectedSizeStock =
    product?.sizes?.find(
      (item) =>
        item.size === selectedSize
    )?.stock ?? null;

  // ============================================================
  // QUANTITY
  // ============================================================

  const maximumQuantity =
    selectedSizeStock !== null
      ? selectedSizeStock
      : totalAvailableStock || 1;

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  };

  const increaseQuantity = () => {
    setQuantity((current) =>
      Math.min(
        maximumQuantity,
        current + 1
      )
    );
  };

  // ============================================================
  // IMAGE NAVIGATION
  // ============================================================

  const resetZoom = () => {
    setZoomLevel(1);

    setPanPosition({
      x: 0,
      y: 0,
    });
  };

  const showPreviousImage = () => {
    if (images.length === 0) {
      return;
    }

    setSelectedImage(
      (current) =>
        current === 0
          ? images.length - 1
          : current - 1
    );

    resetZoom();
  };

  const showNextImage = () => {
    if (images.length === 0) {
      return;
    }

    setSelectedImage(
      (current) =>
        current === images.length - 1
          ? 0
          : current + 1
    );

    resetZoom();
  };

  // ============================================================
  // OPEN / CLOSE ZOOM
  // ============================================================

  const openZoom = () => {
    setZoomOpen(true);
    resetZoom();
  };

  const closeZoom = () => {
    setZoomOpen(false);
    resetZoom();
    setIsDragging(false);
  };

  // ============================================================
  // ZOOM IN
  // ============================================================

  const zoomIn = () => {
    setZoomLevel((current) =>
      Math.min(
        MAX_ZOOM,
        Number(
          (current + ZOOM_STEP).toFixed(2)
        )
      )
    );
  };

  // ============================================================
  // ZOOM OUT
  // ============================================================

  const zoomOut = () => {
    setZoomLevel((current) => {
      const nextZoom = Math.max(
        MIN_ZOOM,
        Number(
          (current - ZOOM_STEP).toFixed(2)
        )
      );

      if (nextZoom === 1) {
        setPanPosition({
          x: 0,
          y: 0,
        });
      }

      return nextZoom;
    });
  };

  // ============================================================
  // MOUSE WHEEL ZOOM
  // ============================================================

  const handleWheelZoom = (event) => {
    event.preventDefault();

    if (event.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  };

  // ============================================================
  // DOUBLE CLICK ZOOM
  // ============================================================

  const handleDoubleClickZoom = () => {
    if (zoomLevel === 1) {
      setZoomLevel(2);
    } else {
      resetZoom();
    }
  };

  // ============================================================
  // DRAG / PAN
  // ============================================================

  const handleMouseDown = (event) => {
    if (zoomLevel <= 1) {
      return;
    }

    event.preventDefault();

    setIsDragging(true);

    setDragStart({
      x:
        event.clientX -
        panPosition.x,
      y:
        event.clientY -
        panPosition.y,
    });
  };

  const handleMouseMove = (event) => {
    if (
      !isDragging ||
      zoomLevel <= 1
    ) {
      return;
    }

    setPanPosition({
      x:
        event.clientX -
        dragStart.x,
      y:
        event.clientY -
        dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // ============================================================
  // KEYBOARD CONTROLS
  // ============================================================

  useEffect(() => {
    if (!zoomOpen) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeZoom();
      }

      if (
        event.key === "ArrowLeft"
      ) {
        showPreviousImage();
      }

      if (
        event.key === "ArrowRight"
      ) {
        showNextImage();
      }

      if (
        event.key === "+" ||
        event.key === "="
      ) {
        zoomIn();
      }

      if (event.key === "-") {
        zoomOut();
      }

      if (event.key === "0") {
        resetZoom();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    zoomOpen,
    selectedImage,
    images.length,
    zoomLevel,
    panPosition,
  ]);

  // ============================================================
  // ADD TO CART
  // ============================================================

  const handleAddToCart = async () => {
    setCartMessage("");
    setCartError("");

    // User must be authenticated
    if (!token) {
      navigate("/login");
      return;
    }

    // Product must exist
    if (!product?._id) {
      setCartError(
        "Product information is unavailable"
      );
      return;
    }

    // Size is required when product has sizes
    if (
      product.sizes?.length > 0 &&
      !selectedSize
    ) {
      setCartError(
        "Please select a size before adding to cart"
      );
      return;
    }

    // Validate selected size stock
    if (
      product.sizes?.length > 0 &&
      selectedSizeStock <= 0
    ) {
      setCartError(
        "The selected size is currently out of stock"
      );
      return;
    }

    // Validate quantity
    if (quantity < 1) {
      setCartError(
        "Quantity must be at least 1"
      );
      return;
    }

    // Prevent quantity greater than stock
    if (
      product.sizes?.length > 0 &&
      quantity > selectedSizeStock
    ) {
      setCartError(
        `Only ${selectedSizeStock} item${
          selectedSizeStock === 1
            ? ""
            : "s"
        } available for size ${selectedSize}`
      );
      return;
    }

    if (
      (!product.sizes ||
        product.sizes.length === 0) &&
      quantity > product.stock
    ) {
      setCartError(
        `Only ${product.stock} item${
          product.stock === 1
            ? ""
            : "s"
        } available`
      );
      return;
    }

    try {
      setCartLoading(true);

      const response =
        await addToCart(
          product._id,
          selectedSize || null,
          quantity,
          token
        );

      setCartMessage(
        response?.message ||
          "Product added to cart successfully"
      );
    } catch (error) {
      console.error(
        "ADD TO CART ERROR:",
        error
      );

      setCartError(
        error.response?.data?.message ||
          "Unable to add product to cart"
      );
    } finally {
      setCartLoading(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
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
            <div className="mb-8 h-3 w-60 bg-[#222222]" />

            <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="h-[620px] bg-[#1b1b1b]" />

              <div className="space-y-6">
                <div className="h-3 w-24 bg-[#222222]" />

                <div className="h-14 w-4/5 bg-[#222222]" />

                <div className="h-6 w-32 bg-[#222222]" />

                <div className="h-16 bg-[#222222]" />

                <div className="h-12 bg-[#222222]" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#111111] text-white">
        <header className="border-b border-[#262626] bg-[#151515]">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-10">
            <Link
              to="/home"
              className="font-serif text-lg"
            >
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

        <main className="flex min-h-[70vh] items-center justify-center px-6">
          <div className="max-w-lg text-center">
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-600">
              Product unavailable
            </p>

            <h1 className="mt-4 font-serif text-3xl text-[#eee7dc]">
              This product is no longer available
            </h1>

            <p className="mt-5 text-sm leading-7 text-neutral-500">
              {error ||
                "The product could not be found."}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/shop")
              }
              className="mt-8 bg-[#e8e0d5] px-8 py-3 text-[10px] uppercase tracking-[0.2em] text-[#151515] transition hover:bg-white"
            >
              Back to Shop
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ============================================================
  // PRODUCT DATA
  // ============================================================

  const categoryName =
    product.category?.name ||
    "Collection";

  const subcategoryName =
    product.subcategory?.name ||
    "";

  const sizes = Array.isArray(
    product.sizes
  )
    ? product.sizes
    : [];

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      {/* ======================================================== */}
      {/* HEADER */}
      {/* ======================================================== */}

      <header className="border-b border-[#262626] bg-[#151515]">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-10">
          <Link
            to="/home"
            className="font-serif text-lg tracking-wide text-white"
          >
            UrbanThread
          </Link>

          <nav className="hidden items-center gap-8 text-[10px] uppercase tracking-[0.2em] text-neutral-500 md:flex">
            <Link
              to="/shop"
              className="text-neutral-200 transition hover:text-white"
            >
              Shop
            </Link>

            <span>
              Collections
            </span>
          </nav>

          <div className="flex items-center gap-4 text-sm text-neutral-400">
            <Link
              to="/wishlist"
              className="transition hover:text-white"
              aria-label="Wishlist"
              title="Wishlist"
            >
              ♡
            </Link>

            <Link
              to="/cart"
              className="transition hover:text-white"
              aria-label="Cart"
              title="Cart"
            >
              🛒
            </Link>

            <Link
              to="/profile"
              className="transition hover:text-white"
              aria-label="Profile"
              title="Profile"
            >
              ♙
            </Link>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MAIN */}
      {/* ======================================================== */}

      <main className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10 lg:py-12">

        {/* ====================================================== */}
        {/* BACK BUTTON */}
        {/* ====================================================== */}

        <button
          type="button"
          onClick={() =>
            navigate("/shop")
          }
          className="mb-7 inline-flex items-center gap-3 border border-[#303030] px-4 py-2.5 text-[9px] uppercase tracking-[0.18em] text-neutral-400 transition hover:border-[#555555] hover:bg-[#191919] hover:text-white"
        >
          <span className="text-sm">
            ←
          </span>

          <span>
            Back to Shop
          </span>
        </button>

        {/* ====================================================== */}
        {/* BREADCRUMBS */}
        {/* ====================================================== */}

        <div className="mb-8 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-neutral-600">
          <Link
            to="/home"
            className="hover:text-neutral-300"
          >
            Home
          </Link>

          <span>/</span>

          <Link
            to="/shop"
            className="hover:text-neutral-300"
          >
            Shop
          </Link>

          <span>/</span>

          <span className="text-neutral-500">
            {categoryName}
          </span>

          {subcategoryName && (
            <>
              <span>/</span>

              <span className="text-neutral-500">
                {subcategoryName}
              </span>
            </>
          )}

          <span>/</span>

          <span className="max-w-[180px] truncate text-neutral-300">
            {product.name}
          </span>
        </div>

        {/* ====================================================== */}
        {/* PRODUCT */}
        {/* ====================================================== */}

        <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] xl:gap-16">

          {/* ==================================================== */}
          {/* GALLERY */}
          {/* ==================================================== */}

          <div>
            <div className="grid grid-cols-[72px_1fr] gap-4">

              {/* THUMBNAILS */}

              <div className="flex flex-col gap-3">
                {images.map(
                  (image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => {
                        setSelectedImage(
                          index
                        );

                        resetZoom();
                      }}
                      className={`aspect-[3/4] overflow-hidden border transition ${
                        selectedImage ===
                        index
                          ? "border-[#d8d0c5]"
                          : "border-[#292929] hover:border-[#555555]"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${
                          index + 1
                        }`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  )
                )}
              </div>

              {/* MAIN IMAGE */}

              <div className="relative aspect-[4/5] overflow-hidden bg-[#181818]">
                {activeImage ? (
                  <button
                    type="button"
                    onClick={openZoom}
                    className="group block h-full w-full cursor-zoom-in"
                    aria-label="Open product image zoom"
                  >
                    <img
                      src={activeImage}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />

                    <span className="absolute bottom-4 right-4 border border-white/10 bg-black/70 px-3 py-2 text-[9px] uppercase tracking-[0.15em] text-neutral-300 opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
                      Click to zoom
                    </span>
                  </button>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-neutral-600">
                    No image
                  </div>
                )}

                {discountPercentage >
                  0 && (
                  <div className="absolute left-4 top-4 bg-[#111111]/90 px-3 py-2 text-[9px] uppercase tracking-[0.15em] text-neutral-200">
                    {discountPercentage}% off
                  </div>
                )}
              </div>
            </div>

            {/* IMAGE NAVIGATION */}

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={
                  showPreviousImage
                }
                disabled={
                  images.length <= 1
                }
                className="border border-[#2d2d2d] px-4 py-2 text-[9px] uppercase tracking-[0.15em] text-neutral-500 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Previous
              </button>

              <span className="text-[9px] uppercase tracking-[0.15em] text-neutral-600">
                {selectedImage + 1} /{" "}
                {images.length}
              </span>

              <button
                type="button"
                onClick={
                  showNextImage
                }
                disabled={
                  images.length <= 1
                }
                className="border border-[#2d2d2d] px-4 py-2 text-[9px] uppercase tracking-[0.15em] text-neutral-500 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>

          {/* ==================================================== */}
          {/* PRODUCT INFO */}
          {/* ==================================================== */}

          <div>
            <p className="text-[9px] uppercase tracking-[0.25em] text-neutral-500">
              {categoryName}
            </p>

            <h1 className="mt-3 max-w-xl font-serif text-4xl leading-[1.05] text-[#eee7dc] sm:text-5xl">
              {product.name}
            </h1>

            {/* RATINGS */}

            <div className="mt-5 flex items-center gap-3 border-b border-[#282828] pb-6">
              <span className="text-[10px] uppercase tracking-[0.15em] text-neutral-500">
                Ratings
              </span>

              <span className="text-sm text-neutral-700">
                ★★★★★
              </span>

              <span className="text-[10px] text-neutral-600">
                Reviews will appear here
                when the review module is
                connected.
              </span>
            </div>

            {/* PRICE */}

            <div className="mt-7 flex items-center gap-3">
              <span className="text-2xl text-[#eee7dc]">
                ₹
                {Number(
                  currentPrice || 0
                ).toLocaleString(
                  "en-IN"
                )}
              </span>

              {product.discountPrice !==
                null &&
                product.discountPrice !==
                  undefined &&
                product.discountPrice <
                  product.price && (
                  <span className="text-sm text-neutral-600 line-through">
                    ₹
                    {Number(
                      product.price
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </span>
                )}
            </div>

            {discountPercentage >
              0 && (
              <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-emerald-400">
                You save{" "}
                {discountPercentage}%
              </p>
            )}

            {/* DESCRIPTION */}

            <div className="mt-8">
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                Description
              </p>

              <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-400">
                {product.description}
              </p>
            </div>

            {/* SIZE */}

            {sizes.length > 0 && (
              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                    Size
                  </span>

                  {selectedSize && (
                    <span className="text-[10px] uppercase tracking-[0.12em] text-neutral-300">
                      {selectedSizeStock}{" "}
                      available
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {sizes.map(
                    (item) => {
                      const unavailable =
                        item.stock <= 0;

                      const selected =
                        selectedSize ===
                        item.size;

                      return (
                        <button
                          key={
                            item.size
                          }
                          type="button"
                          disabled={
                            unavailable ||
                            isOutOfStock
                          }
                          onClick={() => {
                            setSelectedSize(
                              item.size
                            );

                            setQuantity(
                              1
                            );

                            setCartMessage(
                              ""
                            );

                            setCartError(
                              ""
                            );
                          }}
                          className={`h-11 border text-[10px] uppercase tracking-[0.12em] transition ${
                            selected
                              ? "border-[#e8e0d5] bg-[#e8e0d5] text-[#151515]"
                              : unavailable
                              ? "cursor-not-allowed border-[#222222] text-neutral-700 line-through"
                              : "border-[#2d2d2d] text-neutral-400 hover:border-[#666666] hover:text-white"
                          }`}
                        >
                          {item.size}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* AVAILABILITY */}

            <div className="mt-7 flex items-center justify-between border-y border-[#282828] py-4">
              <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                Availability
              </span>

              <span
                className={`text-[10px] uppercase tracking-[0.15em] ${stockStatus.className}`}
              >
                {stockStatus.label}
              </span>
            </div>

            {/* QUANTITY */}

            {!isOutOfStock && (
              <div className="mt-6">
                <span className="mb-3 block text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                  Quantity
                </span>

                <div className="flex w-fit border border-[#303030]">
                  <button
                    type="button"
                    onClick={
                      decreaseQuantity
                    }
                    disabled={
                      quantity <= 1
                    }
                    className="flex h-10 w-10 items-center justify-center text-neutral-400 hover:bg-[#1d1d1d] hover:text-white disabled:cursor-not-allowed disabled:text-neutral-700"
                  >
                    −
                  </button>

                  <span className="flex h-10 w-10 items-center justify-center border-x border-[#303030] text-xs">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={
                      increaseQuantity
                    }
                    disabled={
                      quantity >=
                      maximumQuantity
                    }
                    className="flex h-10 w-10 items-center justify-center text-neutral-400 hover:bg-[#1d1d1d] hover:text-white disabled:cursor-not-allowed disabled:text-neutral-700"
                  >
                    +
                  </button>
                </div>

                {selectedSize &&
                  selectedSizeStock !==
                    null && (
                    <p className="mt-2 text-[9px] text-neutral-600">
                      Maximum available:
                      {" "}
                      {selectedSizeStock}
                    </p>
                  )}
              </div>
            )}

            {/* ================================================== */}
            {/* CART ACTIONS */}
            {/* ================================================== */}

            <div className="mt-7 grid gap-2 sm:grid-cols-[1fr_52px]">
              <button
                type="button"
                onClick={
                  handleAddToCart
                }
                disabled={
                  cartLoading ||
                  isOutOfStock ||
                  (sizes.length > 0 &&
                    !selectedSize) ||
                  (sizes.length > 0 &&
                    selectedSizeStock <=
                      0)
                }
                className="h-12 bg-[#e8e0d5] text-[10px] uppercase tracking-[0.2em] text-[#151515] transition hover:bg-white disabled:cursor-not-allowed disabled:bg-[#292929] disabled:text-neutral-600"
              >
                {cartLoading
                  ? "Adding..."
                  : isOutOfStock
                  ? "Out of Stock"
                  : sizes.length > 0 &&
                    !selectedSize
                  ? "Select Size"
                  : selectedSizeStock !==
                      null &&
                    selectedSizeStock <=
                      0
                  ? "Size Out of Stock"
                  : "Add to Cart"}
              </button>

              <WishlistButton
                productId={product._id}
                className="flex h-12 items-center justify-center border border-[#363636] text-lg text-neutral-400 transition hover:border-[#666666] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* ================================================== */}
            {/* CART SUCCESS */}
            {/* ================================================== */}

            {cartMessage && (
              <div className="mt-4 border border-emerald-900/40 bg-emerald-950/20 px-4 py-3 text-xs text-emerald-400">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    {cartMessage}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/cart"
                      )
                    }
                    className="text-[9px] uppercase tracking-[0.15em] text-emerald-300 underline underline-offset-4 transition hover:text-white"
                  >
                    View Cart
                  </button>
                </div>
              </div>
            )}

            {/* ================================================== */}
            {/* CART ERROR */}
            {/* ================================================== */}

            {cartError && (
              <div className="mt-4 border border-red-900/40 bg-red-950/20 px-4 py-3 text-xs text-red-400">
                {cartError}
              </div>
            )}

            {/* ================================================== */}
            {/* DETAILS */}
            {/* ================================================== */}

            <div className="mt-9 border-t border-[#282828]">

              {/* PRODUCT DETAILS */}

              <details className="group border-b border-[#282828]">
                <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                  <span>
                    Product Details
                  </span>

                  <span className="text-base transition group-open:rotate-45">
                    +
                  </span>
                </summary>

                <div className="pb-5 text-sm leading-7 text-neutral-500">
                  <div className="grid grid-cols-2 gap-y-3">
                    <span>
                      Category
                    </span>

                    <span className="text-right text-neutral-300">
                      {categoryName}
                    </span>

                    <span>
                      Subcategory
                    </span>

                    <span className="text-right text-neutral-300">
                      {subcategoryName ||
                        "—"}
                    </span>

                    <span>
                      Stock
                    </span>

                    <span className="text-right text-neutral-300">
                      {product.stock}
                    </span>

                    <span>
                      Sizes
                    </span>

                    <span className="text-right text-neutral-300">
                      {sizes
                        .map(
                          (item) =>
                            item.size
                        )
                        .join(", ") ||
                        "—"}
                    </span>
                  </div>
                </div>
              </details>

              {/* PRODUCT HIGHLIGHTS */}

              <details className="group border-b border-[#282828]">
                <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                  <span>
                    Product Highlights
                  </span>

                  <span className="text-base transition group-open:rotate-45">
                    +
                  </span>
                </summary>

                <div className="pb-5 text-sm leading-7 text-neutral-500">
                  <ul className="space-y-2">
                    <li>
                      • UrbanThread
                      collection
                    </li>

                    <li>
                      • Multiple size
                      options
                    </li>

                    <li>
                      • Live inventory
                      availability
                    </li>

                    <li>
                      • Category and
                      subcategory
                      classification
                    </li>
                  </ul>
                </div>
              </details>

              {/* SHIPPING */}

              <details className="group border-b border-[#282828]">
                <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                  <span>
                    Shipping & Returns
                  </span>

                  <span className="text-base transition group-open:rotate-45">
                    +
                  </span>
                </summary>

                <div className="pb-5 text-sm leading-7 text-neutral-500">
                  Shipping, return and
                  exchange policies will
                  be connected with the
                  final order workflow.
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* ====================================================== */}
        {/* RELATED PRODUCTS */}
        {/* ====================================================== */}

        <section className="mt-24 border-t border-[#292929] pt-12">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-[0.25em] text-neutral-600">
                Continue exploring
              </p>

              <h2 className="mt-2 font-serif text-3xl text-[#e8e1d7]">
                Related Pieces
              </h2>
            </div>

            <Link
              to="/shop"
              className="text-[9px] uppercase tracking-[0.18em] text-neutral-500 transition hover:text-white"
            >
              View all
            </Link>
          </div>

          {relatedLoading ? (
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="animate-pulse"
                  >
                    <div className="aspect-[4/5] bg-[#1b1b1b]" />

                    <div className="mt-4 h-3 w-3/4 bg-[#222222]" />

                    <div className="mt-2 h-3 w-1/3 bg-[#222222]" />
                  </div>
                )
              )}
            </div>
          ) : relatedProducts.length ===
            0 ? (
            <div className="mt-8 border border-dashed border-[#303030] p-10 text-center">
              <p className="text-sm text-neutral-600">
                No related products
                available yet.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
              {relatedProducts.map(
                (related) => {
                  const image =
                    getImageUrl(
                      related
                        .images?.[0]
                    );

                  const price =
                    related.discountPrice !==
                      null &&
                    related.discountPrice !==
                      undefined &&
                    related.discountPrice <
                      related.price
                      ? related.discountPrice
                      : related.price;

                  return (
                    <Link
                      key={
                        related._id
                      }
                      to={`/products/${related._id}`}
                      className="group"
                    >
                      <div className="aspect-[4/5] overflow-hidden bg-[#181818]">
                        {image ? (
                          <img
                            src={image}
                            alt={
                              related.name
                            }
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[9px] uppercase tracking-[0.15em] text-neutral-700">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="mt-4">
                        <p className="text-[9px] uppercase tracking-[0.16em] text-neutral-600">
                          {
                            related
                              .category
                              ?.name
                          }
                        </p>

                        <h3 className="mt-2 truncate text-sm text-neutral-300 transition group-hover:text-white">
                          {
                            related.name
                          }
                        </h3>

                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-sm text-neutral-200">
                            ₹
                            {Number(
                              price
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </span>

                          {related.discountPrice !==
                            null &&
                            related.discountPrice !==
                              undefined &&
                            related.discountPrice <
                              related.price && (
                              <span className="text-[10px] text-neutral-700 line-through">
                                ₹
                                {Number(
                                  related.price
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </span>
                            )}
                        </div>
                      </div>
                    </Link>
                  );
                }
              )}
            </div>
          )}
        </section>
      </main>

      {/* ======================================================== */}
      {/* ADVANCED IMAGE ZOOM MODAL */}
      {/* ======================================================== */}

      {zoomOpen &&
        activeImage && (
          <div
            className="fixed inset-0 z-[100] bg-black/95"
            onMouseMove={
              handleMouseMove
            }
            onMouseUp={
              handleMouseUp
            }
            onMouseLeave={
              handleMouseUp
            }
            onClick={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeZoom();
              }
            }}
          >
            {/* ================================================== */}
            {/* TOP TOOLBAR */}
            {/* ================================================== */}

            <div className="absolute left-1/2 top-5 z-20 flex -translate-x-1/2 items-center gap-1 border border-[#363636] bg-[#151515]/95 p-1 backdrop-blur-md">

              {/* ZOOM OUT */}

              <button
                type="button"
                onClick={zoomOut}
                disabled={
                  zoomLevel <= MIN_ZOOM
                }
                className="flex h-9 w-9 items-center justify-center text-lg text-neutral-400 transition hover:bg-[#242424] hover:text-white disabled:cursor-not-allowed disabled:text-neutral-700"
                title="Zoom out"
              >
                −
              </button>

              {/* ZOOM PERCENTAGE */}

              <button
                type="button"
                onClick={resetZoom}
                className="h-9 min-w-[72px] px-3 text-[9px] uppercase tracking-[0.12em] text-neutral-300 transition hover:bg-[#242424] hover:text-white"
                title="Reset zoom"
              >
                {Math.round(
                  zoomLevel * 100
                )}
                %
              </button>

              {/* ZOOM IN */}

              <button
                type="button"
                onClick={zoomIn}
                disabled={
                  zoomLevel >= MAX_ZOOM
                }
                className="flex h-9 w-9 items-center justify-center text-lg text-neutral-400 transition hover:bg-[#242424] hover:text-white disabled:cursor-not-allowed disabled:text-neutral-700"
                title="Zoom in"
              >
                +
              </button>

              {/* RESET */}

              <button
                type="button"
                onClick={resetZoom}
                className="ml-1 h-9 border-l border-[#363636] px-4 text-[8px] uppercase tracking-[0.14em] text-neutral-500 transition hover:bg-[#242424] hover:text-white"
              >
                Reset
              </button>

              {/* CLOSE */}

              <button
                type="button"
                onClick={closeZoom}
                className="ml-1 flex h-9 w-9 items-center justify-center border-l border-[#363636] text-lg text-neutral-400 transition hover:bg-[#242424] hover:text-white"
                title="Close"
              >
                ×
              </button>
            </div>

            {/* ================================================== */}
            {/* IMAGE VIEWPORT */}
            {/* ================================================== */}

            <div
              className={`absolute inset-0 flex items-center justify-center overflow-hidden pt-20 pb-16 ${
                zoomLevel > 1
                  ? isDragging
                    ? "cursor-grabbing"
                    : "cursor-grab"
                  : "cursor-default"
              }`}
              onWheel={
                handleWheelZoom
              }
              onMouseDown={
                handleMouseDown
              }
              onDoubleClick={
                handleDoubleClickZoom
              }
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <img
                src={activeImage}
                alt={product.name}
                draggable={false}
                className="max-h-full max-w-full select-none object-contain"
                style={{
                  transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                  transition: isDragging
                    ? "none"
                    : "transform 200ms ease-out",
                }}
              />
            </div>

            {/* ================================================== */}
            {/* PREVIOUS */}
            {/* ================================================== */}

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();

                showPreviousImage();
              }}
              disabled={
                images.length <= 1
              }
              className="absolute left-5 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-[#3b3b3b] bg-[#151515]/80 text-xl text-neutral-400 backdrop-blur-md transition hover:border-[#666666] hover:bg-[#222222] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              title="Previous image"
            >
              ←
            </button>

            {/* ================================================== */}
            {/* NEXT */}
            {/* ================================================== */}

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();

                showNextImage();
              }}
              disabled={
                images.length <= 1
              }
              className="absolute right-5 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-[#3b3b3b] bg-[#151515]/80 text-xl text-neutral-400 backdrop-blur-md transition hover:border-[#666666] hover:bg-[#222222] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              title="Next image"
            >
              →
            </button>

            {/* ================================================== */}
            {/* BOTTOM INFORMATION */}
            {/* ================================================== */}

            <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2">
              <div className="border border-[#303030] bg-[#151515]/90 px-4 py-2 text-[9px] uppercase tracking-[0.16em] text-neutral-500 backdrop-blur-md">
                Image {selectedImage + 1}{" "}
                / {images.length}
              </div>

              <p className="text-center text-[8px] uppercase tracking-[0.15em] text-neutral-700">
                Scroll to zoom • Drag to
                move • Double click to zoom
                • − / + to control • ESC to
                close
              </p>
            </div>
          </div>
        )}

      {/* ======================================================== */}
      {/* FOOTER */}
      {/* ======================================================== */}

      <footer className="mt-20 border-t border-[#262626] bg-[#151515]">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div>
            <div className="font-serif text-base text-neutral-300">
              UrbanThread
            </div>

            <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-neutral-600">
              © 2026 UrbanThread. All rights reserved.
            </p>
          </div>

          <div className="flex gap-6 text-[9px] uppercase tracking-[0.15em] text-neutral-600">
            <span>
              Shipping
            </span>

            <span>
              Returns
            </span>

            <span>
              Privacy
            </span>

            <span>
              Terms
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetails;