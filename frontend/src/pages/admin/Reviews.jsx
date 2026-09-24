import { useEffect, useState } from "react";

import {
  deleteAdminReview,
  getAdminReviews,
} from "../../services/reviewService.js";

const LIMIT = 10;

const Reviews = () => {
  const [reviews, setReviews] = useState([]);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalReviews: 0,
    limit: LIMIT,
  });

  const [loading, setLoading] = useState(true);

  const [deleteLoading, setDeleteLoading] = useState("");

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD REVIEWS
  |--------------------------------------------------------------------------
  */

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminReviews({
        page,
        limit: LIMIT,
        search,
      });

      setReviews(response?.reviews || []);

      setPagination(
        response?.pagination || {
          currentPage: page,
          totalPages: 0,
          totalReviews: 0,
          limit: LIMIT,
        },
      );
    } catch (error) {
      console.error("LOAD ADMIN REVIEWS ERROR:", error);

      setReviews([]);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load reviews",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReviews();
  }, [page]);

  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);

    void loadReviews();
  };

  /*
  |--------------------------------------------------------------------------
  | CLEAR SEARCH
  |--------------------------------------------------------------------------
  */

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE REVIEW
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (reviewId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(reviewId);

      setError("");
      setSuccess("");

      await deleteAdminReview(reviewId);

      setSuccess("Review deleted successfully.");

      /*
       * If the last item on the current page
       * was deleted, move back one page when
       * possible.
       */

      if (reviews.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      } else {
        await loadReviews();
      }
    } catch (error) {
      console.error("DELETE ADMIN REVIEW ERROR:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to delete review",
      );
    } finally {
      setDeleteLoading("");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE
  |--------------------------------------------------------------------------
  */

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | USER NAME
  |--------------------------------------------------------------------------
  */

  const getUserName = (review) => {
    return review?.user?.name || "Unknown User";
  };

  /*
  |--------------------------------------------------------------------------
  | USER EMAIL
  |--------------------------------------------------------------------------
  */

  const getUserEmail = (review) => {
    return review?.user?.email || "No email";
  };

  /*
  |--------------------------------------------------------------------------
  | PRODUCT NAME
  |--------------------------------------------------------------------------
  */

  const getProductName = (review) => {
    return review?.product?.name || "Unknown Product";
  };

  return (
    <div className="min-h-screen bg-[#111111] px-6 py-8 text-white lg:px-10">
      <div className="mx-auto max-w-[1600px]">
        {/* ====================================================== */}
        {/* HEADER */}
        {/* ====================================================== */}

        <div className="mb-8 flex flex-col justify-between gap-5 border-b border-[#292929] pb-7 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600">
              Customer Feedback
            </p>

            <h1 className="mt-3 font-serif text-4xl text-[#e8e3dc]">Reviews</h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
              View and manage customer reviews across all UrbanThread products.
            </p>
          </div>

          <div className="border border-[#292929] bg-[#151515] px-6 py-4">
            <p className="text-[9px] uppercase tracking-[0.16em] text-neutral-600">
              Total Reviews
            </p>

            <p className="mt-2 text-2xl text-white">
              {pagination.totalReviews}
            </p>
          </div>
        </div>

        {/* ====================================================== */}
        {/* SEARCH */}
        {/* ====================================================== */}

        <section className="mb-6 border border-[#292929] bg-[#151515] p-6">
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 md:flex-row"
          >
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by customer, email, product or review..."
              className="min-h-[44px] flex-1 border border-[#363636] bg-[#111111] px-4 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-[#666666]"
            />

            <button
              type="submit"
              className="min-h-[44px] border border-white bg-white px-7 text-[10px] uppercase tracking-[0.16em] text-black hover:bg-neutral-200"
            >
              Search
            </button>

            <button
              type="button"
              onClick={handleClearSearch}
              className="min-h-[44px] border border-[#3a3a3a] px-7 text-[10px] uppercase tracking-[0.16em] text-neutral-400 hover:border-[#666666] hover:text-white"
            >
              Clear
            </button>
          </form>
        </section>

        {/* ====================================================== */}
        {/* MESSAGES */}
        {/* ====================================================== */}

        {error && (
          <div className="mb-6 border border-red-900/50 bg-red-950/20 px-5 py-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 border border-emerald-900/50 bg-emerald-950/20 px-5 py-4 text-sm text-emerald-400">
            {success}
          </div>
        )}

        {/* ====================================================== */}
        {/* REVIEWS TABLE */}
        {/* ====================================================== */}

        <section className="border border-[#292929] bg-[#151515]">
          {loading ? (
            <div className="flex min-h-[350px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-6 w-6 animate-spin rounded-full border-2 border-[#444444] border-t-white" />

                <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                  Loading reviews
                </p>
              </div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex min-h-[350px] items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-neutral-400">No reviews found.</p>

                <p className="mt-2 text-xs text-neutral-600">
                  Customer reviews will appear here when they are submitted.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-[#292929] text-left">
                    <th className="px-6 py-4 text-[9px] uppercase tracking-[0.16em] text-neutral-600">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-[9px] uppercase tracking-[0.16em] text-neutral-600">
                      Product
                    </th>

                    <th className="px-6 py-4 text-[9px] uppercase tracking-[0.16em] text-neutral-600">
                      Review
                    </th>

                    <th className="px-6 py-4 text-[9px] uppercase tracking-[0.16em] text-neutral-600">
                      Date
                    </th>

                    <th className="px-6 py-4 text-right text-[9px] uppercase tracking-[0.16em] text-neutral-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {reviews.map((review) => (
                    <tr
                      key={review._id}
                      className="border-b border-[#222222] hover:bg-[#181818]"
                    >
                      {/* CUSTOMER */}

                      <td className="px-6 py-5 align-top">
                        <p className="text-sm text-white">
                          {getUserName(review)}
                        </p>

                        <p className="mt-1 text-xs text-neutral-600">
                          {getUserEmail(review)}
                        </p>
                      </td>

                      {/* PRODUCT */}

                      <td className="px-6 py-5 align-top">
                        <p className="max-w-[220px] text-sm text-neutral-300">
                          {getProductName(review)}
                        </p>
                      </td>

                      {/* REVIEW */}

                      <td className="max-w-[550px] px-6 py-5 align-top">
                        <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-300">
                          {review.comment}
                        </p>
                      </td>

                      {/* DATE */}

                      <td className="whitespace-nowrap px-6 py-5 align-top text-xs text-neutral-500">
                        {formatDate(review.createdAt)}
                      </td>

                      {/* DELETE */}

                      <td className="px-6 py-5 text-right align-top">
                        <button
                          type="button"
                          onClick={() => handleDelete(review._id)}
                          disabled={deleteLoading === review._id}
                          className="border border-red-900/60 px-3 py-2 text-[9px] uppercase tracking-[0.12em] text-red-400 hover:border-red-500 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deleteLoading === review._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ====================================================== */}
        {/* PAGINATION */}
        {/* ====================================================== */}

        {!loading && pagination.totalPages > 0 && (
          <div className="mt-6 flex flex-col gap-4 border border-[#292929] bg-[#151515] px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs text-neutral-500">
                Page{" "}
                <span className="text-white">{pagination.currentPage}</span> of{" "}
                <span className="text-white">{pagination.totalPages}</span>
              </p>

              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-neutral-700">
                {pagination.totalReviews} total reviews
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((previous) => Math.max(previous - 1, 1))}
                className="border border-[#3a3a3a] px-5 py-2 text-[9px] uppercase tracking-[0.14em] text-neutral-400 hover:border-[#666666] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Previous
              </button>

              {Array.from(
                {
                  length: pagination.totalPages,
                },
                (_, index) => index + 1,
              )
                .filter((pageNumber) => {
                  return (
                    pageNumber === 1 ||
                    pageNumber === pagination.totalPages ||
                    Math.abs(pageNumber - page) <= 1
                  );
                })
                .map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    className={`min-w-[36px] border px-3 py-2 text-[9px] uppercase tracking-[0.1em] ${
                      pageNumber === page
                        ? "border-white bg-white text-black"
                        : "border-[#3a3a3a] text-neutral-400 hover:border-[#666666] hover:text-white"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() =>
                  setPage((previous) =>
                    Math.min(previous + 1, pagination.totalPages),
                  )
                }
                className="border border-[#3a3a3a] px-5 py-2 text-[9px] uppercase tracking-[0.14em] text-neutral-400 hover:border-[#666666] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
