import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";

import AdminLayout from "../../components/admin/AdminLayout";

import {
  getCategories,
  deleteCategory,
  toggleCategoryStatus,
} from "../../services/categoryService";

const Categories = () => {
  // ==========================================
  // STATE
  // ==========================================

  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [limit] = useState(10);

  const [totalPages, setTotalPages] = useState(1);

  const [totalCategories, setTotalCategories] =
    useState(0);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] =
    useState("");

  const [error, setError] = useState("");

  // ==========================================
  // FETCH CATEGORIES
  // ==========================================

  const fetchCategories = useCallback(
    async (
      searchValue = search,
      pageValue = page
    ) => {
      try {
        setLoading(true);
        setError("");

        const response = await getCategories({
          search: searchValue.trim(),
          page: pageValue,
          limit,
          sortBy: "createdAt",
          sortOrder: "desc",
        });

        setCategories(
          Array.isArray(response?.categories)
            ? response.categories
            : []
        );

        setTotalPages(
          Number(response?.totalPages) || 1
        );

        setTotalCategories(
          Number(
            response?.totalCategories
          ) || 0
        );
      } catch (err) {
        console.error(
          "Fetch categories error:",
          err
        );

        setCategories([]);

        setError(
          err?.response?.data?.message ||
            "Failed to load categories"
        );
      } finally {
        setLoading(false);
      }
    },
    [search, page, limit]
  );

  // ==========================================
  // INITIAL LOAD + SEARCH + PAGINATION
  // ==========================================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories(search, page);
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [
    search,
    page,
    fetchCategories,
  ]);

  // ==========================================
  // SEARCH INPUT
  // ==========================================

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearch(value);

    // Always return to page 1 when searching
    setPage(1);
  };

  // ==========================================
  // CLEAR SEARCH
  // ==========================================

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
  };

  // ==========================================
  // DELETE CATEGORY
  // ==========================================

  const handleDelete = async (categoryId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(categoryId);
      setError("");

      /*
       * Backend performs SOFT DELETE.
       */
      await deleteCategory(categoryId);

      /*
       * Reload the current category list.
       */
      await fetchCategories(
        search,
        page
      );
    } catch (err) {
      console.error(
        "Delete category error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to delete category"
      );
    } finally {
      setActionLoading("");
    }
  };

  // ==========================================
  // TOGGLE CATEGORY STATUS
  // ==========================================

  const handleToggleStatus = async (
    categoryId
  ) => {
    try {
      setActionLoading(categoryId);
      setError("");

      await toggleCategoryStatus(
        categoryId
      );

      await fetchCategories(
        search,
        page
      );
    } catch (err) {
      console.error(
        "Toggle category status error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to update category status"
      );
    } finally {
      setActionLoading("");
    }
  };

  // ==========================================
  // PAGINATION
  // ==========================================

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(
        (previousPage) =>
          previousPage - 1
      );
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(
        (previousPage) =>
          previousPage + 1
      );
    }
  };

  // ==========================================
  // PAGE NUMBERS
  // ==========================================

  const getPageNumbers = () => {
    const pages = [];

    for (
      let pageNumber = 1;
      pageNumber <= totalPages;
      pageNumber++
    ) {
      pages.push(pageNumber);
    }

    return pages;
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <AdminLayout>
      <div className="min-h-full bg-[#111111] px-6 py-6 text-white md:px-8">

        {/* ======================================
            PAGE HEADER
        ====================================== */}

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-gray-500">
              Management
            </p>

            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Categories
            </h1>

            <p className="mt-1 text-xs text-gray-500">
              Create and manage product categories.
            </p>
          </div>

          {/* ADD CATEGORY */}

          <Link
            to="/admin/categories/add"
            className="w-fit bg-[#f1f0ed] px-5 py-3 text-[11px] font-semibold tracking-wide text-black transition hover:bg-white"
          >
            + Add Category
          </Link>
        </div>

        {/* ======================================
            SEARCH
        ====================================== */}

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">

          <div className="relative w-full max-w-sm">

            <input
              type="text"
              value={search}
              onChange={
                handleSearchChange
              }
              placeholder="Search categories..."
              className="w-full border border-[#292929] bg-[#191919] px-4 py-3 pr-10 text-xs text-white outline-none placeholder:text-gray-600 focus:border-gray-500"
            />

            {/* SMALL X CLEAR BUTTON */}

            {search && (
              <button
                type="button"
                onClick={
                  handleClearSearch
                }
                aria-label="Clear search"
                title="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-lg leading-none text-gray-500 transition hover:text-white"
              >
                ×
              </button>
            )}
          </div>

          {/* CLEAR BUTTON */}

          {search && (
            <button
              type="button"
              onClick={
                handleClearSearch
              }
              className="w-fit border border-[#383838] px-4 py-3 text-[10px] font-semibold text-gray-400 transition hover:border-gray-500 hover:bg-[#1b1b1b] hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* ======================================
            ERROR MESSAGE
        ====================================== */}

        {error && (
          <div className="mb-4 border border-red-900/60 bg-red-950/30 px-4 py-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* ======================================
            CATEGORY TABLE
        ====================================== */}

        <div className="overflow-hidden border border-[#242424] bg-[#171717]">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px] border-collapse">

              {/* ==================================
                  TABLE HEADER
              ================================== */}

              <thead>
                <tr className="border-b border-[#292929] bg-[#1d1d1d]">

                  <th className="w-14 px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    #
                  </th>

                  <th className="min-w-[180px] px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Category
                  </th>

                  <th className="min-w-[350px] px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Description
                  </th>

                  <th className="min-w-[120px] px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="min-w-[200px] px-4 py-4 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>

                </tr>
              </thead>

              {/* ==================================
                  TABLE BODY
              ================================== */}

              <tbody>

                {/* LOADING */}

                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-12 text-center text-xs text-gray-500"
                    >
                      Loading categories...
                    </td>
                  </tr>

                ) : categories.length === 0 ? (

                  /* EMPTY */

                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-12 text-center"
                    >
                      <p className="text-xs text-gray-500">
                        {search
                          ? `No categories found for "${search}".`
                          : "No categories found."}
                      </p>

                      {search && (
                        <button
                          type="button"
                          onClick={
                            handleClearSearch
                          }
                          className="mt-3 text-xs text-gray-400 underline underline-offset-4 transition hover:text-white"
                        >
                          Clear search
                        </button>
                      )}
                    </td>
                  </tr>

                ) : (

                  /* CATEGORY DATA */

                  categories.map(
                    (
                      category,
                      index
                    ) => (
                      <tr
                        key={
                          category._id
                        }
                        className="border-b border-[#242424] last:border-b-0 transition hover:bg-[#1c1c1c]"
                      >

                        {/* NUMBER */}

                        <td className="px-4 py-4 text-xs text-gray-600">
                          {(page - 1) *
                            limit +
                            index +
                            1}
                        </td>

                        {/* CATEGORY */}

                        <td className="px-4 py-4">
                          <p className="text-xs font-semibold text-white">
                            {
                              category.name
                            }
                          </p>
                        </td>

                        {/* DESCRIPTION */}

                        <td className="max-w-md px-4 py-4">
                          <p className="truncate text-xs text-gray-500">
                            {category
                              .description ||
                              "—"}
                          </p>
                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-4">

                          <button
                            type="button"
                            onClick={() =>
                              handleToggleStatus(
                                category._id
                              )
                            }
                            disabled={
                              actionLoading ===
                              category._id
                            }
                            className={`rounded-full px-3 py-1 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              category.isActive
                                ? "bg-green-950 text-green-400 hover:bg-green-900"
                                : "bg-red-950 text-red-400 hover:bg-red-900"
                            }`}
                          >
                            {actionLoading ===
                            category._id
                              ? "..."
                              : category.isActive
                                ? "Active"
                                : "Inactive"}
                          </button>

                        </td>

                        {/* ACTIONS */}

                        <td className="px-4 py-4">

                          <div className="flex justify-end gap-2">

                            {/* EDIT */}

                            <Link
                              to={`/admin/categories/edit/${category._id}`}
                              className="border border-[#383838] px-3 py-1.5 text-[10px] text-gray-300 transition hover:border-gray-500 hover:bg-[#222222] hover:text-white"
                            >
                              Edit
                            </Link>

                            {/* DELETE */}

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  category._id
                                )
                              }
                              disabled={
                                actionLoading ===
                                category._id
                              }
                              className="border border-red-950 px-3 py-1.5 text-[10px] text-red-400 transition hover:border-red-700 hover:bg-red-950/30 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {actionLoading ===
                              category._id
                                ? "..."
                                : "Delete"}
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>
            </table>
          </div>

          {/* ======================================
              PAGINATION
          ====================================== */}

          {!loading &&
            totalCategories > 0 && (
              <div className="flex flex-col gap-4 border-t border-[#292929] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">

                {/* RESULT COUNT */}

                <p className="text-[11px] text-gray-500">

                  Showing{" "}

                  <span className="text-gray-300">
                    {(page - 1) *
                      limit +
                      1}
                  </span>

                  {" "}to{" "}

                  <span className="text-gray-300">
                    {Math.min(
                      page * limit,
                      totalCategories
                    )}
                  </span>

                  {" "}of{" "}

                  <span className="text-gray-300">
                    {
                      totalCategories
                    }
                  </span>

                  {" "}categories

                </p>

                {/* PAGINATION CONTROLS */}

                <div className="flex items-center gap-1">

                  {/* PREVIOUS */}

                  <button
                    type="button"
                    onClick={
                      handlePreviousPage
                    }
                    disabled={
                      page === 1
                    }
                    className="border border-[#333333] px-3 py-2 text-[10px] text-gray-400 transition hover:bg-[#252525] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {/* PAGE NUMBERS */}

                  {getPageNumbers().map(
                    (pageNumber) => (
                      <button
                        key={
                          pageNumber
                        }
                        type="button"
                        onClick={() =>
                          setPage(
                            pageNumber
                          )
                        }
                        className={`min-w-8 px-3 py-2 text-[10px] transition ${
                          page ===
                          pageNumber
                            ? "bg-white text-black"
                            : "border border-[#333333] text-gray-400 hover:bg-[#252525] hover:text-white"
                        }`}
                      >
                        {
                          pageNumber
                        }
                      </button>
                    )
                  )}

                  {/* NEXT */}

                  <button
                    type="button"
                    onClick={
                      handleNextPage
                    }
                    disabled={
                      page >=
                      totalPages
                    }
                    className="border border-[#333333] px-3 py-2 text-[10px] text-gray-400 transition hover:bg-[#252525] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>

                </div>
              </div>
            )}

        </div>
      </div>
    </AdminLayout>
  );
};

export default Categories;