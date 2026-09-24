import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import WishlistButton from "../../components/user/WishlistButton";

import {
  getShopProducts,
  getShopCategories,
  getShopSubcategories,
} from "../../services/shopService";

const Shop = () => {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [categories, setCategories] = useState([]);

  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [subcategories, setSubcategories] = useState([]);

  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");

  const [search, setSearch] = useState("");

  const [categoryId, setCategoryId] = useState("");

  const [subcategoryId, setSubcategoryId] = useState("");

  const [minPrice, setMinPrice] = useState("");

  const [maxPrice, setMaxPrice] = useState("");

  const [sortOption, setSortOption] = useState("latest");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 12,
  });

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const response = await getShopCategories();

        if (!isMounted) {
          return;
        }

        setCategories(
          Array.isArray(response?.categories) ? response.categories : [],
        );
      } catch (err) {
        console.error("Fetch shop categories error:", err);

        if (isMounted) {
          setCategories([]);
        }
      } finally {
        if (isMounted) {
          setCategoriesLoading(false);
        }
      }
    };

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadSubcategories = async () => {
      try {
        await Promise.resolve();

        if (!isMounted) {
          return;
        }

        setSubcategoriesLoading(true);

        const response = await getShopSubcategories({
          categoryId,
        });

        if (!isMounted) {
          return;
        }

        setSubcategories(
          Array.isArray(response?.subcategories) ? response.subcategories : [],
        );
      } catch (err) {
        console.error("Fetch shop subcategories error:", err);

        if (isMounted) {
          setSubcategories([]);
        }
      } finally {
        if (isMounted) {
          setSubcategoriesLoading(false);
        }
      }
    };

    void loadSubcategories();

    return () => {
      isMounted = false;
    };
  }, [categoryId]);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        await Promise.resolve();

        if (!isMounted) {
          return;
        }

        setLoading(true);
        setError("");

        let sortBy = "createdAt";
        let sortOrder = "desc";

        switch (sortOption) {
          case "price-low":
            sortBy = "price";
            sortOrder = "asc";
            break;

          case "price-high":
            sortBy = "price";
            sortOrder = "desc";
            break;

          case "name-az":
            sortBy = "name";
            sortOrder = "asc";
            break;

          case "name-za":
            sortBy = "name";
            sortOrder = "desc";
            break;

          case "latest":
          default:
            sortBy = "createdAt";
            sortOrder = "desc";
            break;
        }

        const response = await getShopProducts({
          search,
          categoryId,
          subcategoryId,
          minPrice,
          maxPrice,
          page,
          limit: 12,
          sortBy,
          sortOrder,
        });

        if (!isMounted) {
          return;
        }

        setProducts(Array.isArray(response?.products) ? response.products : []);

        setPagination(
          response?.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalProducts: 0,
            limit: 12,
          },
        );
      } catch (err) {
        console.error("Fetch shop products error:", err);

        if (isMounted) {
          setProducts([]);
          setError(err?.response?.data?.message || "Failed to load products");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, [search, categoryId, subcategoryId, minPrice, maxPrice, sortOption, page]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    setPage(1);

    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleCategoryChange = (event) => {
    const selectedCategoryId = event.target.value;

    setCategoryId(selectedCategoryId);

    setSubcategoryId("");

    setPage(1);
  };

  const handleSubcategoryChange = (event) => {
    setSubcategoryId(event.target.value);

    setPage(1);
  };

  const handleMinPriceChange = (event) => {
    setMinPrice(event.target.value);

    setPage(1);
  };

  const handleMaxPriceChange = (event) => {
    setMaxPrice(event.target.value);

    setPage(1);
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);

    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearch("");

    setCategoryId("");
    setSubcategoryId("");

    setMinPrice("");
    setMaxPrice("");

    setSortOption("latest");

    setPage(1);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((previousPage) => previousPage - 1);
    }
  };

  const handleNextPage = () => {
    if (page < pagination.totalPages) {
      setPage((previousPage) => previousPage + 1);
    }
  };

  const getProductImage = (product) => {
    if (Array.isArray(product?.images) && product.images.length > 0) {
      return product.images[0]?.url || "";
    }

    return "";
  };

  const getDisplayPrice = (product) => {
    if (
      product?.discountPrice !== null &&
      product?.discountPrice !== undefined &&
      product.discountPrice < product.price
    ) {
      return product.discountPrice;
    }

    return product?.price;
  };

  const getDiscountPercentage = (product) => {
    if (
      product?.discountPrice === null ||
      product?.discountPrice === undefined ||
      product.discountPrice >= product.price
    ) {
      return 0;
    }

    return Math.round(
      ((product.price - product.discountPrice) / product.price) * 100,
    );
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <header className="border-b border-[#292929] bg-[#151515]">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10">
          <Link
            to="/home"
            className="font-serif text-xl tracking-wide text-white"
          >
            UrbanThread
          </Link>

          <nav className="hidden items-center gap-8 text-xs text-neutral-500 md:flex">
            <Link to="/home" className="transition hover:text-white">
              Home
            </Link>

            <Link to="/shop" className="text-white">
              Shop
            </Link>

            <Link to="/categories" className="transition hover:text-white">
              Categories
            </Link>
          </nav>

          <div className="flex items-center gap-5 text-neutral-400">
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
            >
              ♙
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] px-6 py-10 md:px-10">
        <div className="mb-10">
          <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-neutral-600">
            Collection
          </p>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="font-serif text-4xl text-white md:text-5xl">
                Shop
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
                Explore our collection of carefully selected pieces designed for
                everyday urban style.
              </p>
            </div>

            <p className="text-xs text-neutral-600">
              {pagination.totalProducts} products
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="mb-8 flex w-full flex-col gap-2 sm:flex-row"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search products..."
              className="w-full border border-[#292929] bg-[#181818] px-5 py-4 pr-12 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-neutral-500"
            />

            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-neutral-600 transition hover:text-white"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <button
            type="submit"
            className="bg-white px-7 py-4 text-xs font-semibold uppercase tracking-wider text-black transition hover:bg-neutral-200"
          >
            Search
          </button>
        </form>

        <div className="mb-10 border-y border-[#292929] py-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-6 lg:items-end">
            <div className="lg:col-span-2">
              <label className="mb-2 block text-[10px] uppercase tracking-wider text-neutral-600">
                Category
              </label>

              <select
                value={categoryId}
                onChange={handleCategoryChange}
                disabled={categoriesLoading}
                className="w-full border border-[#292929] bg-[#181818] px-4 py-3 text-xs text-neutral-300 outline-none focus:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {categoriesLoading
                    ? "Loading categories..."
                    : "All Categories"}
                </option>

                {!categoriesLoading &&
                  categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-[10px] uppercase tracking-wider text-neutral-600">
                Subcategory
              </label>

              <select
                value={subcategoryId}
                onChange={handleSubcategoryChange}
                disabled={subcategoriesLoading || subcategories.length === 0}
                className="w-full border border-[#292929] bg-[#181818] px-4 py-3 text-xs text-neutral-300 outline-none focus:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {subcategoriesLoading
                    ? "Loading subcategories..."
                    : subcategories.length === 0
                      ? categoryId
                        ? "No subcategories available"
                        : "All Subcategories"
                      : "All Subcategories"}
                </option>

                {!subcategoriesLoading &&
                  subcategories.map((subcategory) => (
                    <option key={subcategory._id} value={subcategory._id}>
                      {subcategory.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[10px] uppercase tracking-wider text-neutral-600">
                Min Price
              </label>

              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={handleMinPriceChange}
                placeholder="₹ 0"
                className="w-full border border-[#292929] bg-[#181818] px-4 py-3 text-xs text-white outline-none placeholder:text-neutral-600 focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] uppercase tracking-wider text-neutral-600">
                Max Price
              </label>

              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={handleMaxPriceChange}
                placeholder="₹ 10,000"
                className="w-full border border-[#292929] bg-[#181818] px-4 py-3 text-xs text-white outline-none placeholder:text-neutral-600 focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] uppercase tracking-wider text-neutral-600">
                Sort By
              </label>

              <select
                value={sortOption}
                onChange={handleSortChange}
                className="w-full border border-[#292929] bg-[#181818] px-4 py-3 text-xs text-neutral-300 outline-none focus:border-neutral-500"
              >
                <option value="latest">Latest</option>

                <option value="price-low">Price: Low to High</option>

                <option value="price-high">Price: High to Low</option>

                <option value="name-az">Name: A to Z</option>

                <option value="name-za">Name: Z to A</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleClearFilters}
              className="border border-[#383838] px-5 py-3 text-[10px] uppercase tracking-wider text-neutral-400 transition hover:border-neutral-500 hover:bg-[#1c1c1c] hover:text-white"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 border border-red-900/60 bg-red-950/20 px-5 py-4 text-xs text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({
              length: 8,
            }).map((_, index) => (
              <div key={index}>
                <div className="aspect-[3/4] animate-pulse bg-[#1b1b1b]" />

                <div className="mt-4 h-3 w-2/3 animate-pulse bg-[#1b1b1b]" />

                <div className="mt-3 h-3 w-1/3 animate-pulse bg-[#1b1b1b]" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="border border-[#242424] bg-[#171717] px-6 py-20 text-center">
            <h2 className="font-serif text-2xl text-white">
              No products found
            </h2>

            <p className="mt-3 text-xs text-neutral-600">
              Try changing your search or filters.
            </p>

            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-6 border border-[#383838] px-6 py-3 text-[10px] uppercase tracking-wider text-neutral-400 transition hover:border-neutral-500 hover:text-white"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
            {products.map((product) => {
              const image = getProductImage(product);

              const displayPrice = getDisplayPrice(product);

              const discountPercentage = getDiscountPercentage(product);

              return (
                <div key={product._id} className="group min-w-0">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#1a1a1a]">
                    <Link
                      to={`/products/${product._id}`}
                      className="block h-full w-full"
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-neutral-700">
                          No Image
                        </div>
                      )}

                      {discountPercentage > 0 && (
                        <span className="absolute left-3 top-3 bg-white px-2 py-1 text-[9px] font-semibold text-black">
                          {discountPercentage}% OFF
                        </span>
                      )}

                      {product.stock <= 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                          <span className="border border-neutral-600 bg-[#111111]/90 px-4 py-2 text-[9px] uppercase tracking-wider text-neutral-300">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </Link>

                    <WishlistButton
                      productId={product._id}
                      className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center border border-white/10 bg-[#111111]/85 text-lg text-neutral-300 backdrop-blur-sm transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <Link to={`/products/${product._id}`} className="block">
                    <div className="mt-4">
                      <p className="text-xs text-neutral-500">
                        {product.category?.name || "Collection"}
                      </p>

                      <h2 className="mt-1 truncate text-sm font-medium text-white">
                        {product.name}
                      </h2>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-white">
                          ₹{Number(displayPrice || 0).toLocaleString("en-IN")}
                        </span>

                        {discountPercentage > 0 && (
                          <span className="text-xs text-neutral-600 line-through">
                            ₹
                            {Number(product.price || 0).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {!loading && pagination.totalProducts > 0 && (
          <div className="mt-16 flex flex-col items-center justify-between gap-5 border-t border-[#292929] pt-6 sm:flex-row">
            <p className="text-[11px] text-neutral-600">
              Page{" "}
              <span className="text-neutral-300">{pagination.currentPage}</span>{" "}
              of{" "}
              <span className="text-neutral-300">{pagination.totalPages}</span>
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePreviousPage}
                disabled={page === 1}
                className="border border-[#333333] px-5 py-2.5 text-[10px] uppercase tracking-wider text-neutral-400 transition hover:bg-[#202020] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Previous
              </button>

              {Array.from(
                {
                  length: pagination.totalPages,
                },
                (_, index) => index + 1,
              ).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={`min-w-9 px-3 py-2.5 text-[10px] transition ${
                    page === pageNumber
                      ? "bg-white text-black"
                      : "border border-[#333333] text-neutral-500 hover:bg-[#202020] hover:text-white"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                onClick={handleNextPage}
                disabled={page >= pagination.totalPages}
                className="border border-[#333333] px-5 py-2.5 text-[10px] uppercase tracking-wider text-neutral-400 transition hover:bg-[#202020] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-[#292929] bg-[#151515]">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-12 md:grid-cols-4 md:px-10">
          <div className="md:col-span-2">
            <h2 className="font-serif text-xl text-white">UrbanThread</h2>

            <p className="mt-4 max-w-sm text-xs leading-6 text-neutral-600">
              Elevating urban style with architectural precision and
              uncompromising quality.
            </p>

            <p className="mt-6 text-[10px] text-neutral-700">
              © 2024 UrbanThread. All rights reserved.
            </p>
          </div>

          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              Shop
            </h3>

            <div className="mt-4 space-y-3 text-xs text-neutral-600">
              <Link to="/shop" className="block transition hover:text-white">
                Shirts
              </Link>

              <Link to="/shop" className="block transition hover:text-white">
                T-Shirts
              </Link>

              <Link to="/shop" className="block transition hover:text-white">
                Jeans
              </Link>

              <Link to="/shop" className="block transition hover:text-white">
                Jackets
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              Help
            </h3>

            <div className="mt-4 space-y-3 text-xs text-neutral-600">
              <Link to="/profile" className="block transition hover:text-white">
                Account
              </Link>

              <span className="block">Returns</span>

              <span className="block">Shipping</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Shop;
