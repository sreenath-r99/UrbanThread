import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../components/admin/AdminLayout";

import {
  getSubcategories,
  toggleSubcategoryStatus,
  deleteSubcategory,
} from "../../services/subcategoryService";

const Subcategories = () => {
  const navigate = useNavigate();

  // ==========================================
  // STATE
  // ==========================================

  const [subcategories, setSubcategories] =
    useState([]);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [limit] = useState(10);

  const [totalPages, setTotalPages] = useState(1);

  const [totalSubcategories, setTotalSubcategories] =
    useState(0);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] =
    useState("");

  const [error, setError] = useState("");

  // ==========================================
  // FETCH SUBCATEGORIES
  // ==========================================

  const fetchSubcategories = useCallback(
    async (
      searchValue = search,
      pageValue = page
    ) => {
      try {
        setLoading(true);
        setError("");

        const response = await getSubcategories({
          search: searchValue.trim(),
          page: pageValue,
          limit,
          sortBy: "createdAt",
          sortOrder: "desc",
        });

        /*
         * Expected backend response:
         *
         * {
         *   success: true,
         *   subcategories: [],
         *   currentPage: 1,
         *   totalPages: 2,
         *   totalSubcategories: 15
         * }
         */

        setSubcategories(
          Array.isArray(
            response?.subcategories
          )
            ? response.subcategories
            : []
        );

        setTotalPages(
          Number(response?.totalPages) || 1
        );

        setTotalSubcategories(
          Number(
            response?.totalSubcategories
          ) || 0
        );
      } catch (error) {
        console.error(
          "Fetch subcategories error:",
          error
        );

        setSubcategories([]);

        setError(
          error?.response?.data?.message ||
            "Failed to load subcategories"
        );
      } finally {
        setLoading(false);
      }
    },
    [search, page, limit]
  );

  // ==========================================
  // SEARCH / INITIAL LOAD
  // ==========================================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubcategories(search, page);
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [
    search,
    page,
    fetchSubcategories,
  ]);

  // ==========================================
  // SEARCH CHANGE
  // ==========================================

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearch(value);

    /*
     * Whenever a new search starts,
     * return to page 1.
     */
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
  // TOGGLE STATUS
  // ==========================================

  const handleToggleStatus = async (
    subcategoryId
  ) => {
    try {
      setActionLoading(subcategoryId);
      setError("");

      await toggleSubcategoryStatus(
        subcategoryId
      );

      await fetchSubcategories(
        search,
        page
      );
    } catch (error) {
      console.error(
        "Toggle subcategory status error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to update subcategory status"
      );
    } finally {
      setActionLoading("");
    }
  };

  // ==========================================
  // DELETE SUBCATEGORY
  // ==========================================

  const handleDelete = async (
    subcategoryId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subcategory?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(subcategoryId);
      setError("");

      /*
       * Backend should perform SOFT DELETE.
       */
      await deleteSubcategory(
        subcategoryId
      );

      await fetchSubcategories(
        search,
        page
      );
    } catch (error) {
      console.error(
        "Delete subcategory error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to delete subcategory"
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
              Subcategories
            </h1>

            <p className="mt-1 text-xs text-gray-500">
              Create and manage product
              subcategories.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/subcategories/add"
              )
            }
            className="w-fit bg-[#f1f0ed] px-5 py-3 text-[11px] font-semibold tracking-wide text-black transition hover:bg-white"
          >
            + Add Subcategory
          </button>
        </div>

        {/* ======================================
            SEARCH
        ====================================== */}

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search subcategories..."
              value={search}
              onChange={
                handleSearchChange
              }
              className="w-full border border-[#292929] bg-[#191919] px-4 py-3 pr-10 text-xs text-white outline-none placeholder:text-gray-600 focus:border-gray-500"
            />

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

          {search && (
            <button
              type="button"
              onClick={
                handleClearSearch
              }
              className="w-fit border border-[#383838] px-4 py-3 text-[10px] font-semibold text-gray-400 transition hover:border-gray-500 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* ======================================
            ERROR
        ====================================== */}

        {error && (
          <div className="mb-4 border border-red-900/60 bg-red-950/30 px-4 py-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* ======================================
            TABLE
        ====================================== */}

        <div className="overflow-hidden border border-[#242424] bg-[#171717]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">

              {/* ==================================
                  TABLE HEADER
              ================================== */}

              <thead>
                <tr className="border-b border-[#292929] bg-[#1d1d1d]">

                  <th className="w-14 px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    #
                  </th>

                  <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Subcategory
                  </th>

                  <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Parent Category
                  </th>

                  <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Description
                  </th>

                  <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="px-4 py-4 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-500">
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
                      colSpan="6"
                      className="px-4 py-12 text-center text-xs text-gray-500"
                    >
                      Loading
                      subcategories...
                    </td>
                  </tr>

                ) : subcategories.length ===
                  0 ? (

                  /* EMPTY */

                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-12 text-center"
                    >
                      <p className="text-xs text-gray-500">
                        {search
                          ? `No subcategories found for "${search}".`
                          : "No subcategories found."}
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

                  /* DATA */

                  subcategories.map(
                    (
                      subcategory,
                      index
                    ) => (
                      <tr
                        key={
                          subcategory._id
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

                        {/* SUBCATEGORY */}

                        <td className="px-4 py-4">
                          <p className="text-xs font-semibold text-white">
                            {
                              subcategory.name
                            }
                          </p>
                        </td>

                        {/* PARENT CATEGORY */}

                        <td className="px-4 py-4 text-xs text-gray-400">
                          {subcategory
                            .category
                            ?.name ||
                            "Unknown"}
                        </td>

                        {/* DESCRIPTION */}

                        <td className="max-w-xs px-4 py-4">
                          <p className="truncate text-xs text-gray-500">
                            {subcategory
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
                                subcategory._id
                              )
                            }
                            disabled={
                              actionLoading ===
                              subcategory._id
                            }
                            className={`rounded-full px-3 py-1 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              subcategory.isActive
                                ? "bg-green-950 text-green-400 hover:bg-green-900"
                                : "bg-red-950 text-red-400 hover:bg-red-900"
                            }`}
                          >
                            {actionLoading ===
                            subcategory._id
                              ? "..."
                              : subcategory.isActive
                                ? "Active"
                                : "Inactive"}
                          </button>
                        </td>

                        {/* ACTIONS */}

                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">

                            {/* EDIT */}

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin/subcategories/edit/${subcategory._id}`
                                )
                              }
                              className="border border-[#383838] px-3 py-1.5 text-[10px] text-gray-300 transition hover:border-gray-500 hover:bg-[#222222] hover:text-white"
                            >
                              Edit
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  subcategory._id
                                )
                              }
                              disabled={
                                actionLoading ===
                                subcategory._id
                              }
                              className="border border-red-950 px-3 py-1.5 text-[10px] text-red-400 transition hover:border-red-700 hover:bg-red-950/30 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {actionLoading ===
                              subcategory._id
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
            totalSubcategories > 0 && (
              <div className="flex flex-col gap-4 border-t border-[#292929] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">

                {/* TOTAL */}

                <p className="text-[11px] text-gray-500">
                  Showing{" "}
                  <span className="text-gray-300">
                    {(page - 1) *
                      limit +
                      1}
                  </span>{" "}
                  to{" "}
                  <span className="text-gray-300">
                    {Math.min(
                      page * limit,
                      totalSubcategories
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="text-gray-300">
                    {
                      totalSubcategories
                    }
                  </span>{" "}
                  subcategories
                </p>

                {/* PAGINATION BUTTONS */}

                <div className="flex items-center gap-1">

                  {/* PREVIOUS */}

                  <button
                    type="button"
                    onClick={
                      handlePreviousPage
                    }
                    disabled={page === 1}
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

export default Subcategories;