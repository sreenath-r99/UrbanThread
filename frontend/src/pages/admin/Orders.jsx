import {
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getAdminOrder,
  getAdminOrders,
  updateAdminOrderStatus,
  updateAdminOrderItemReturn,
} from "../../services/orderService";

import { AdminAuthContext } from "../../context/AdminAuthContext";

/*
|--------------------------------------------------------------------------
| STATUS OPTIONS
|--------------------------------------------------------------------------
*/

const STATUS_OPTIONS = [
  "Pending",
  "Partially Cancelled",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

/*
|--------------------------------------------------------------------------
| STATUS COLORS
|--------------------------------------------------------------------------
*/

const getStatusClass = (status) => {
  switch (status) {
    case "Pending":
      return "border-yellow-800 bg-yellow-950/40 text-yellow-300";

    case "Partially Cancelled":
      return "border-orange-800 bg-orange-950/40 text-orange-300";

    case "Shipped":
      return "border-blue-800 bg-blue-950/40 text-blue-300";

    case "Out for Delivery":
      return "border-purple-800 bg-purple-950/40 text-purple-300";

    case "Delivered":
      return "border-green-800 bg-green-950/40 text-green-300";

    case "Cancelled":
      return "border-red-800 bg-red-950/40 text-red-300";

    default:
      return "border-[#3a3a3a] bg-[#202020] text-neutral-300";
  }
};

/*
|--------------------------------------------------------------------------
| FORMAT DATE
|--------------------------------------------------------------------------
*/

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

/*
|--------------------------------------------------------------------------
| FORMAT DATE + TIME
|--------------------------------------------------------------------------
*/

const formatDateTime = (date) => {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

/*
|--------------------------------------------------------------------------
| CURRENCY
|--------------------------------------------------------------------------
*/

const formatCurrency = (amount) => {
  return `₹${Number(
    amount || 0
  ).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/*
|--------------------------------------------------------------------------
| RETURN STATUS TRANSITIONS
|--------------------------------------------------------------------------
*/

const getAllowedNextReturnStatuses = (currentStatus) => {
  switch (currentStatus) {
    case "Requested":
      return ["Approved", "Rejected"];

    case "Approved":
      return ["Pickup Scheduled"];

    case "Pickup Scheduled":
      return ["Picked Up"];

    case "Picked Up":
      return ["In Transit"];

    case "In Transit":
      return ["Received"];

    case "Received":
      return ["Inspected"];

    case "Inspected":
      return ["Refund Completed"];

    default:
      return [];
  }
};

/*
|--------------------------------------------------------------------------
| RETURN STATUS COLORS
|--------------------------------------------------------------------------
*/

const getReturnStatusClass = (status) => {
  switch (status) {
    case "Requested":
      return "border-yellow-800 bg-yellow-950/40 text-yellow-300";

    case "Approved":
    case "Pickup Scheduled":
    case "Picked Up":
    case "In Transit":
    case "Received":
    case "Inspected":
      return "border-blue-800 bg-blue-950/40 text-blue-300";

    case "Refund Completed":
      return "border-green-800 bg-green-950/40 text-green-300";

    case "Rejected":
      return "border-red-800 bg-red-950/40 text-red-300";

    default:
      return "border-[#3a3a3a] bg-[#202020] text-neutral-300";
  }
};

/*
|--------------------------------------------------------------------------
| ORDER STATUS TRANSITIONS
|--------------------------------------------------------------------------
*/

const getAllowedNextStatuses = (
  currentStatus
) => {
  switch (currentStatus) {
    case "Pending":
      return [
        "Shipped",
        "Cancelled",
      ];

    case "Partially Cancelled":
      return [
        "Shipped",
        "Cancelled",
      ];

    case "Shipped":
      return [
        "Out for Delivery",
      ];

    case "Out for Delivery":
      return [
        "Delivered",
      ];

    case "Delivered":
      return [];

    case "Cancelled":
      return [];

    default:
      return [];
  }
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

const Orders = () => {
  const {
    adminToken,
    loading: adminLoading,
  } = useContext(AdminAuthContext);

  /*
   * ---------------------------------------------------------------
   * LIST STATE
   * ---------------------------------------------------------------
   */

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
   * ---------------------------------------------------------------
   * FILTER STATE
   * ---------------------------------------------------------------
   */

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [sortOrder, setSortOrder] =
    useState("desc");

  /*
   * ---------------------------------------------------------------
   * UPDATE RETURN STATUS
   * ---------------------------------------------------------------
   */

  const handleReturnStatusUpdate = async (
    itemId,
    nextReturnStatus
  ) => {
    if (
      !selectedOrder ||
      !adminToken ||
      updatingReturnItemId
    ) {
      return;
    }

    try {
      setUpdatingReturnItemId(itemId);
      setReturnError("");

      const response =
        await updateAdminOrderItemReturn(
          selectedOrder._id,
          itemId,
          nextReturnStatus,
          adminToken
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to update return status"
        );
      }

      setSelectedOrder(response.order);

      await fetchOrders();
    } catch (returnUpdateError) {
      console.error(
        "UPDATE ADMIN RETURN STATUS ERROR:",
        returnUpdateError
      );

      setReturnError(
        returnUpdateError?.response?.data
          ?.message ||
          returnUpdateError.message ||
          "Unable to update return status"
      );
    } finally {
      setUpdatingReturnItemId("");
    }
  };

  /*
   * ---------------------------------------------------------------
   * PAGINATION
   * ---------------------------------------------------------------
   */

  const [page, setPage] =
    useState(1);

  const [limit] =
    useState(10);

  const [pagination, setPagination] =
    useState({
      currentPage: 1,
      totalPages: 0,
      totalOrders: 0,
      limit: 10,
      hasNextPage: false,
      hasPreviousPage: false,
    });

  /*
   * ---------------------------------------------------------------
   * DETAIL MODAL
   * ---------------------------------------------------------------
   */

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [detailLoading, setDetailLoading] =
    useState(false);

  const [detailError, setDetailError] =
    useState("");

  /*
   * ---------------------------------------------------------------
   * STATUS UPDATE
   * ---------------------------------------------------------------
   */

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [statusError, setStatusError] =
    useState("");

  /*
   * ---------------------------------------------------------------
   * RETURN UPDATE
   * ---------------------------------------------------------------
   */

  const [updatingReturnItemId, setUpdatingReturnItemId] =
    useState("");

  const [returnError, setReturnError] =
    useState("");

  /*
   * ---------------------------------------------------------------
   * CANCELLATION REASON
   * ---------------------------------------------------------------
   */

  const [showCancelReason, setShowCancelReason] =
    useState(false);

  const [cancelReason, setCancelReason] =
    useState("");

  /*
   * ---------------------------------------------------------------
   * FETCH ORDERS
   * ---------------------------------------------------------------
   */

  const fetchOrders = useCallback(
    async () => {
      if (!adminToken) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await getAdminOrders(
            adminToken,
            {
              page,
              limit,
              search,
              status,
              sortOrder,
            }
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Unable to fetch orders"
          );
        }

        setOrders(
          response.orders || []
        );

        setPagination(
          response.pagination || {
            currentPage: page,
            totalPages: 0,
            totalOrders: 0,
            limit,
            hasNextPage: false,
            hasPreviousPage: false,
          }
        );
      } catch (fetchError) {
        console.error(
          "FETCH ADMIN ORDERS ERROR:",
          fetchError
        );

        setError(
          fetchError?.response?.data
            ?.message ||
            fetchError.message ||
            "Unable to fetch orders"
        );

        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    [
      adminToken,
      page,
      limit,
      search,
      status,
      sortOrder,
    ]
  );

  /*
   * ---------------------------------------------------------------
   * LOAD ORDERS
   * ---------------------------------------------------------------
   */

  useEffect(() => {
    if (!adminLoading) {
      fetchOrders();
    }
  }, [
    adminLoading,
    fetchOrders,
  ]);

  /*
   * ---------------------------------------------------------------
   * SEARCH
   * ---------------------------------------------------------------
   */

  const handleSearchChange = (
    event
  ) => {
    setSearch(event.target.value);
    setPage(1);
  };

  /*
   * ---------------------------------------------------------------
   * STATUS FILTER
   * ---------------------------------------------------------------
   */

  const handleStatusChange = (
    event
  ) => {
    setStatus(event.target.value);
    setPage(1);
  };

  /*
   * ---------------------------------------------------------------
   * SORT
   * ---------------------------------------------------------------
   */

  const handleSortChange = (
    event
  ) => {
    setSortOrder(event.target.value);
    setPage(1);
  };

  /*
   * ---------------------------------------------------------------
   * CLEAR FILTERS
   * ---------------------------------------------------------------
   */

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setSortOrder("desc");
    setPage(1);
  };

  /*
   * ---------------------------------------------------------------
   * VIEW ORDER DETAILS
   * ---------------------------------------------------------------
   */

  const handleViewOrder = async (
    orderId
  ) => {
    if (!adminToken) {
      return;
    }

    try {
      setDetailLoading(true);
      setDetailError("");
      setSelectedOrder(null);
      setStatusError("");
      setReturnError("");
      setShowCancelReason(false);
      setCancelReason("");

      const response =
        await getAdminOrder(
          orderId,
          adminToken
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to fetch order details"
        );
      }

      setSelectedOrder(
        response.order
      );
    } catch (detailFetchError) {
      console.error(
        "FETCH ADMIN ORDER ERROR:",
        detailFetchError
      );

      setDetailError(
        detailFetchError?.response
          ?.data?.message ||
          detailFetchError.message ||
          "Unable to fetch order details"
      );
    } finally {
      setDetailLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------------
   * CLOSE DETAILS
   * ---------------------------------------------------------------
   */

  const handleCloseDetails = () => {
    if (updatingStatus || updatingReturnItemId) {
      return;
    }

    setSelectedOrder(null);
    setDetailError("");
    setStatusError("");
    setReturnError("");
    setShowCancelReason(false);
    setCancelReason("");
  };

  /*
   * ---------------------------------------------------------------
   * CHANGE ORDER STATUS
   * ---------------------------------------------------------------
   */

  const handleStatusUpdate = async (
    nextStatus
  ) => {
    if (
      !selectedOrder ||
      !adminToken ||
      updatingStatus
    ) {
      return;
    }

    setStatusError("");

    /*
     * Cancellation requires a reason.
     */

    if (
      nextStatus === "Cancelled"
    ) {
      if (!showCancelReason) {
        setShowCancelReason(true);
        return;
      }

      if (!cancelReason.trim()) {
        setStatusError(
          "Cancellation reason is required."
        );

        return;
      }
    }

    try {
      setUpdatingStatus(true);

      const response =
        await updateAdminOrderStatus(
          selectedOrder._id,
          nextStatus,
          adminToken,
          cancelReason.trim()
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to update order status"
        );
      }

      /*
       * Update modal immediately.
       */

      setSelectedOrder(
        response.order
      );

      setShowCancelReason(false);
      setCancelReason("");

      /*
       * Refresh listing so status,
       * filters and pagination remain
       * synchronized with MongoDB.
       */

      await fetchOrders();
    } catch (statusUpdateError) {
      console.error(
        "UPDATE ADMIN ORDER STATUS ERROR:",
        statusUpdateError
      );

      setStatusError(
        statusUpdateError?.response
          ?.data?.message ||
          statusUpdateError.message ||
          "Unable to update order status"
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  /*
   * ---------------------------------------------------------------
   * PAGINATION
   * ---------------------------------------------------------------
   */

  const handlePreviousPage = () => {
    if (
      pagination.hasPreviousPage
    ) {
      setPage(
        (currentPage) =>
          currentPage - 1
      );
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setPage(
        (currentPage) =>
          currentPage + 1
      );
    }
  };

  /*
   * ---------------------------------------------------------------
   * PAGE NUMBERS
   * ---------------------------------------------------------------
   */

  const getPageNumbers = () => {
    const totalPages =
      pagination.totalPages;

    const currentPage =
      pagination.currentPage;

    if (!totalPages) {
      return [];
    }

    const pages = [];

    const start = Math.max(
      1,
      currentPage - 2
    );

    const end = Math.min(
      totalPages,
      currentPage + 2
    );

    for (
      let number = start;
      number <= end;
      number += 1
    ) {
      pages.push(number);
    }

    return pages;
  };

  /*
   * ---------------------------------------------------------------
   * LOADING STATE
   * ---------------------------------------------------------------
   */

  if (adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111111] text-neutral-400">
        Loading admin session...
      </div>
    );
  }
    /*
   * ---------------------------------------------------------------
   * PAGE
   * ---------------------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-[#111111] px-8 py-8 text-white">
      {/* ==========================================================
          HEADER
      ========================================================== */}

      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[#292929] pb-6 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Administration
          </p>

          <h1 className="font-serif text-3xl tracking-wide text-white">
            Orders
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Manage customer orders and
            fulfillment status.
          </p>
        </div>

        <div className="text-sm text-neutral-500">
          {pagination.totalOrders}{" "}
          {pagination.totalOrders === 1
            ? "order"
            : "orders"}
        </div>
      </div>

      {/* ==========================================================
          FILTER BAR
      ========================================================== */}

      <div className="mb-6 border border-[#292929] bg-[#151515] p-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(240px,1fr)_220px_200px_auto]">
          {/* SEARCH */}

          <div>
            <label className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-neutral-500">
              Search
            </label>

            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Order ID, customer name, phone..."
              className="h-11 w-full border border-[#303030] bg-[#111111] px-4 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-[#5a5a5a]"
            />
          </div>

          {/* STATUS */}

          <div>
            <label className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-neutral-500">
              Status
            </label>

            <select
              value={status}
              onChange={handleStatusChange}
              className="h-11 w-full border border-[#303030] bg-[#111111] px-4 text-sm text-white outline-none focus:border-[#5a5a5a]"
            >
              <option value="">
                All statuses
              </option>

              {STATUS_OPTIONS.map(
                (statusOption) => (
                  <option
                    key={statusOption}
                    value={statusOption}
                  >
                    {statusOption}
                  </option>
                )
              )}
            </select>
          </div>

          {/* SORT */}

          <div>
            <label className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-neutral-500">
              Sort by date
            </label>

            <select
              value={sortOrder}
              onChange={handleSortChange}
              className="h-11 w-full border border-[#303030] bg-[#111111] px-4 text-sm text-white outline-none focus:border-[#5a5a5a]"
            >
              <option value="desc">
                Newest first
              </option>

              <option value="asc">
                Oldest first
              </option>
            </select>
          </div>

          {/* CLEAR */}

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleClearFilters}
              className="h-11 border border-[#3a3a3a] px-5 text-sm text-neutral-300 transition hover:bg-[#242424] hover:text-white"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* ==========================================================
          ERROR
      ========================================================== */}

      {error && (
        <div className="mb-6 border border-red-900 bg-red-950/30 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* ==========================================================
          TABLE
      ========================================================== */}

      <div className="overflow-hidden border border-[#292929] bg-[#151515]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px]">
            <thead>
              <tr className="border-b border-[#292929] text-left">
                <th className="px-5 py-4 text-[10px] uppercase tracking-[0.14em] text-neutral-500">
                  Order ID
                </th>

                <th className="px-5 py-4 text-[10px] uppercase tracking-[0.14em] text-neutral-500">
                  Customer
                </th>

                <th className="px-5 py-4 text-[10px] uppercase tracking-[0.14em] text-neutral-500">
                  Date
                </th>

                <th className="px-5 py-4 text-[10px] uppercase tracking-[0.14em] text-neutral-500">
                  Amount
                </th>

                <th className="px-5 py-4 text-[10px] uppercase tracking-[0.14em] text-neutral-500">
                  Status
                </th>

                <th className="px-5 py-4 text-[10px] uppercase tracking-[0.14em] text-neutral-500">
                  Returns
                </th>

                <th className="px-5 py-4 text-right text-[10px] uppercase tracking-[0.14em] text-neutral-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-16 text-center text-sm text-neutral-500"
                  >
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-16 text-center"
                  >
                    <p className="text-sm text-neutral-400">
                      No orders found.
                    </p>

                    <p className="mt-1 text-xs text-neutral-600">
                      Try changing your
                      search or filters.
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-[#242424] transition hover:bg-[#191919]"
                  >
                    {/* ORDER ID */}

                    <td className="px-5 py-5">
                      <p className="font-mono text-sm text-white">
                        {order.orderId}
                      </p>

                      <p className="mt-1 text-xs text-neutral-600">
                        {order.items?.length || 0}{" "}
                        {order.items?.length === 1
                          ? "item"
                          : "items"}
                      </p>
                    </td>

                    {/* CUSTOMER */}

                    <td className="px-5 py-5">
                      <p className="text-sm text-neutral-200">
                        {order.user?.name ||
                          order.shippingAddress?.fullName ||
                          "Unknown"}
                      </p>

                      <p className="mt-1 text-xs text-neutral-600">
                        {order.user?.email || "-"}
                      </p>
                    </td>

                    {/* DATE */}

                    <td className="px-5 py-5">
                      <p className="text-sm text-neutral-300">
                        {formatDate(order.createdAt)}
                      </p>
                    </td>

                    {/* AMOUNT */}

                    <td className="px-5 py-5">
                      <p className="text-sm text-neutral-200">
                        {formatCurrency(
                          order.totalAmount
                        )}
                      </p>
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex border px-3 py-1.5 text-xs ${getStatusClass(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>

                    {/* RETURNS */}

                    <td className="px-5 py-5">
                      {(() => {
                        const returnItems =
                          order.items?.filter(
                            (item) =>
                              item?.returnStatus &&
                              item.returnStatus !==
                                "Not Requested"
                          ) || [];

                        if (returnItems.length === 0) {
                          return (
                            <span className="text-xs text-neutral-600">
                              No requests
                            </span>
                          );
                        }

                        const hasRequested =
                          returnItems.some(
                            (item) =>
                              item.returnStatus ===
                              "Requested"
                          );

                        const hasApproved =
                          returnItems.some(
                            (item) =>
                              item.returnStatus ===
                              "Approved"
                          );

                        return (
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex border px-2.5 py-1 text-[10px] ${
                                hasRequested
                                  ? "border-yellow-800 bg-yellow-950/40 text-yellow-300"
                                  : hasApproved
                                    ? "border-green-800 bg-green-950/40 text-green-300"
                                    : "border-red-800 bg-red-950/40 text-red-300"
                              }`}
                            >
                              {hasRequested
                                ? "Requested"
                                : hasApproved
                                  ? "Approved"
                                  : "Rejected"}
                            </span>

                            <span className="text-[10px] text-neutral-600">
                              {returnItems.length} item
                              {returnItems.length === 1
                                ? ""
                                : "s"}
                            </span>
                          </div>
                        );
                      })()}
                    </td>

                    {/* ACTION */}

                    <td className="px-5 py-5 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          handleViewOrder(order._id)
                        }
                        className="border border-[#3a3a3a] px-4 py-2 text-xs text-neutral-300 transition hover:bg-[#242424] hover:text-white"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================================
          PAGINATION
      ========================================================== */}

      {!loading &&
        pagination.totalPages > 0 && (
          <div className="mt-5 flex flex-col gap-4 border border-[#292929] bg-[#151515] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-neutral-500">
              Page{" "}
              <span className="text-neutral-300">
                {pagination.currentPage}
              </span>{" "}
              of{" "}
              <span className="text-neutral-300">
                {pagination.totalPages}
              </span>
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={
                  !pagination.hasPreviousPage
                }
                onClick={handlePreviousPage}
                className="border border-[#303030] px-3 py-2 text-xs text-neutral-400 transition hover:bg-[#242424] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Previous
              </button>

              {getPageNumbers().map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() =>
                      setPage(pageNumber)
                    }
                    className={`min-w-9 border px-3 py-2 text-xs transition ${
                      pagination.currentPage ===
                      pageNumber
                        ? "border-white bg-white text-black"
                        : "border-[#303030] text-neutral-400 hover:bg-[#242424] hover:text-white"
                    }`}
                  >
                    {pageNumber}
                  </button>
                )
              )}

              <button
                type="button"
                disabled={
                  !pagination.hasNextPage
                }
                onClick={handleNextPage}
                className="border border-[#303030] px-3 py-2 text-xs text-neutral-400 transition hover:bg-[#242424] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
              {/* ==========================================================
          ORDER DETAIL MODAL
      ========================================================== */}

      {(detailLoading ||
        selectedOrder ||
        detailError) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden border border-[#353535] bg-[#151515]">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-[#292929] px-6 py-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  Order Details
                </p>

                <h2 className="mt-1 font-mono text-lg text-white">
                  {selectedOrder?.orderId ||
                    "Loading..."}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCloseDetails}
                disabled={
                  updatingStatus ||
                  Boolean(updatingReturnItemId)
                }
                className="flex h-9 w-9 items-center justify-center border border-[#353535] text-lg text-neutral-500 transition hover:bg-[#242424] hover:text-white disabled:opacity-30"
              >
                ×
              </button>
            </div>

            {/* MODAL CONTENT */}

            <div className="overflow-y-auto p-6">
              {detailLoading ? (
                <div className="py-20 text-center text-sm text-neutral-500">
                  Loading order details...
                </div>
              ) : detailError ? (
                <div className="border border-red-900 bg-red-950/30 px-5 py-4 text-sm text-red-300">
                  {detailError}
                </div>
              ) : selectedOrder ? (
                <div className="space-y-7">
                  {/* ==================================================
                      TOP INFORMATION
                  ================================================== */}

                  <div className="grid gap-5 md:grid-cols-3">
                    {/* CUSTOMER */}

                    <div className="border border-[#292929] bg-[#111111] p-5">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-600">
                        Customer
                      </p>

                      <p className="mt-3 text-sm text-white">
                        {selectedOrder.user?.name ||
                          selectedOrder.shippingAddress
                            ?.fullName ||
                          "-"}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        {selectedOrder.user?.email ||
                          "-"}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        {selectedOrder.user?.phone ||
                          selectedOrder.shippingAddress
                            ?.phone ||
                          "-"}
                      </p>
                    </div>

                    {/* ORDER DATE */}

                    <div className="border border-[#292929] bg-[#111111] p-5">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-600">
                        Order Date
                      </p>

                      <p className="mt-3 text-sm text-white">
                        {formatDateTime(
                          selectedOrder.createdAt
                        )}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        Payment:{" "}
                        {selectedOrder.paymentMethod}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        Payment status:{" "}
                        {selectedOrder.paymentStatus}
                      </p>
                    </div>

                    {/* STATUS */}

                    <div className="border border-[#292929] bg-[#111111] p-5">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-600">
                        Current Status
                      </p>

                      <div className="mt-3">
                        <span
                          className={`inline-flex border px-3 py-1.5 text-xs ${getStatusClass(
                            selectedOrder.orderStatus
                          )}`}
                        >
                          {selectedOrder.orderStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ==================================================
                      SHIPPING ADDRESS
                  ================================================== */}

                  <div className="border border-[#292929] bg-[#111111] p-5">
                    <p className="mb-4 text-[10px] uppercase tracking-[0.15em] text-neutral-600">
                      Delivery Address
                    </p>

                    <div className="text-sm leading-6 text-neutral-300">
                      <p>
                        {
                          selectedOrder
                            .shippingAddress
                            ?.fullName
                        }
                      </p>

                      <p>
                        {
                          selectedOrder
                            .shippingAddress
                            ?.houseName
                        }
                        ,{" "}
                        {
                          selectedOrder
                            .shippingAddress
                            ?.street
                        }
                      </p>

                      <p>
                        {
                          selectedOrder
                            .shippingAddress
                            ?.city
                        }
                        ,{" "}
                        {
                          selectedOrder
                            .shippingAddress
                            ?.state
                        }{" "}
                        -{" "}
                        {
                          selectedOrder
                            .shippingAddress
                            ?.pincode
                        }
                      </p>

                      <p>
                        {
                          selectedOrder
                            .shippingAddress
                            ?.country
                        }
                      </p>

                      <p className="mt-2 text-xs text-neutral-500">
                        Phone:{" "}
                        {
                          selectedOrder
                            .shippingAddress
                            ?.phone
                        }
                      </p>
                    </div>
                  </div>

                  {/* ==================================================
                      PRODUCTS
                  ================================================== */}

                  <div>
                    <p className="mb-4 text-[10px] uppercase tracking-[0.15em] text-neutral-600">
                      Products
                    </p>

                    <div className="overflow-hidden border border-[#292929]">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                          <thead>
                            <tr className="border-b border-[#292929] bg-[#111111]">
                              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-neutral-600">
                                Product
                              </th>

                              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-neutral-600">
                                Size
                              </th>

                              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-neutral-600">
                                Qty
                              </th>

                              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-neutral-600">
                                Price
                              </th>

                              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-neutral-600">
                                Total
                              </th>

                              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-neutral-600">
                                Item Status
                              </th>

                              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-neutral-600">
                                Return Management
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {selectedOrder.items?.map(
                              (item) => (
                                <tr
                                  key={item._id}
                                  className="border-b border-[#242424]"
                                >
                                  <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                      {item.productImage ? (
                                        <img
                                          src={
                                            item.productImage
                                          }
                                          alt={
                                            item.productName
                                          }
                                          className="h-12 w-10 object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-12 w-10 items-center justify-center bg-[#242424] text-[9px] text-neutral-600">
                                          No image
                                        </div>
                                      )}

                                      <div>
                                        <p className="text-sm text-neutral-200">
                                          {
                                            item.productName
                                          }
                                        </p>

                                        <p className="mt-1 text-xs text-neutral-600">
                                          {item.itemStatus ===
                                          "Cancelled"
                                            ? "Cancelled item"
                                            : "Active item"}
                                        </p>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="px-4 py-4 text-sm text-neutral-300">
                                    {item.size}
                                  </td>

                                  <td className="px-4 py-4 text-sm text-neutral-300">
                                    {item.quantity}
                                  </td>

                                  <td className="px-4 py-4 text-sm text-neutral-300">
                                    {formatCurrency(
                                      item.price
                                    )}
                                  </td>

                                  <td className="px-4 py-4 text-sm text-neutral-300">
                                    {formatCurrency(
                                      item.itemTotal
                                    )}
                                  </td>

                                  <td className="px-4 py-4">
                                    <span
                                      className={`text-xs ${
                                        item.itemStatus ===
                                        "Cancelled"
                                          ? "text-red-400"
                                          : "text-green-400"
                                      }`}
                                    >
                                      {item.itemStatus}
                                    </span>
                                  </td>

                                  {/* RETURN MANAGEMENT */}

                                  <td className="px-4 py-4">
                                    <div className="min-w-[210px]">
                                      {item.returnStatus ===
                                      "Not Requested" ? (
                                        <span className="text-xs text-neutral-600">
                                          No return request
                                        </span>
                                      ) : (
                                        <>
                                          <span
                                            className={`inline-flex border px-2.5 py-1 text-[10px] ${getReturnStatusClass(
                                              item.returnStatus
                                            )}`}
                                          >
                                            {item.returnStatus}
                                          </span>

                                          {item.returnReason && (
                                            <p className="mt-2 max-w-[260px] text-xs leading-5 text-neutral-500">
                                              Reason:{" "}
                                              {item.returnReason}
                                            </p>
                                          )}

                                          {item.returnRequestedAt && (
                                            <p className="mt-1 text-[10px] text-neutral-600">
                                              Requested:{" "}
                                              {formatDateTime(
                                                item.returnRequestedAt
                                              )}
                                            </p>
                                          )}

                                          {getAllowedNextReturnStatuses(
                                            item.returnStatus
                                          ).length > 0 && (
                                            <div className="mt-3">
                                              <label
                                                htmlFor={`return-status-${item._id}`}
                                                className="mb-1.5 block text-[10px] uppercase tracking-[0.12em] text-neutral-500"
                                              >
                                                Update return
                                              </label>

                                              <select
                                                id={`return-status-${item._id}`}
                                                value=""
                                                disabled={Boolean(
                                                  updatingReturnItemId
                                                )}
                                                onChange={(
                                                  event
                                                ) => {
                                                  const nextStatus =
                                                    event.target
                                                      .value;

                                                  if (
                                                    nextStatus
                                                  ) {
                                                    handleReturnStatusUpdate(
                                                      item._id,
                                                      nextStatus
                                                    );
                                                  }
                                                }}
                                                className="w-full border border-[#303030] bg-[#111111] px-2.5 py-2 text-xs text-neutral-200 outline-none focus:border-[#5a5a5a] disabled:cursor-not-allowed disabled:opacity-40"
                                              >
                                                <option
                                                  value=""
                                                  disabled
                                                >
                                                  Select next status
                                                </option>

                                                {getAllowedNextReturnStatuses(
                                                  item.returnStatus
                                                ).map(
                                                  (
                                                    nextStatus
                                                  ) => (
                                                    <option
                                                      key={
                                                        nextStatus
                                                      }
                                                      value={
                                                        nextStatus
                                                      }
                                                    >
                                                      {nextStatus}
                                                    </option>
                                                  )
                                                )}
                                              </select>

                                              {updatingReturnItemId ===
                                                item._id && (
                                                <p className="mt-1 text-[10px] text-neutral-500">
                                                  Updating...
                                                </p>
                                              )}
                                            </div>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                 
{/* ==================================================
    TOTALS
================================================== */}

{(() => {
  const activeItems = (selectedOrder.items || []).filter(
    (item) => item.itemStatus !== "Cancelled"
  );

  const roundMoney = (value) =>
    Number(Math.max(Number(value) || 0, 0).toFixed(2));

  const subtotal = roundMoney(
    activeItems.reduce((sum, item) => {
      const quantity = Math.max(Number(item.quantity) || 0, 0);
      const price = Math.max(Number(item.price) || 0, 0);

      return sum + price * quantity;
    }, 0)
  );

  const productDiscount = roundMoney(
    activeItems.reduce((sum, item) => {
      const quantity = Math.max(Number(item.quantity) || 0, 0);
      const price = Math.max(Number(item.price) || 0, 0);
      const discount = Math.min(
        Math.max(Number(item.discount) || 0, 0),
        price
      );

      return sum + discount * quantity;
    }, 0)
  );

  const amountAfterProductDiscount = roundMoney(
    Math.max(subtotal - productDiscount, 0)
  );

  // Assumes the applied coupon is DIWALI10 (10%).
  const couponDiscount =
    activeItems.length > 0
      ? roundMoney(amountAfterProductDiscount * 0.10)
      : 0;

  const shippingCharge =
    activeItems.length > 0
      ? Math.max(Number(selectedOrder.shippingCharge) || 0, 0)
      : 0;

  const tax =
    activeItems.length > 0
      ? Math.max(Number(selectedOrder.tax) || 0, 0)
      : 0;

  const totalAmount = roundMoney(
    Math.max(
      amountAfterProductDiscount -
        couponDiscount +
        shippingCharge +
        tax,
      0
    )
  );

  return (
    <div className="flex justify-end">
      <div className="w-full max-w-sm border border-[#292929] bg-[#111111] p-5">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">Subtotal</span>
            <span className="text-neutral-300">
              {formatCurrency(subtotal)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-neutral-500">
              Product Discount
            </span>
            <span className="text-neutral-300">
              - {formatCurrency(productDiscount)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-neutral-500">
              Amount After Product Discount
            </span>
            <span className="text-neutral-300">
              {formatCurrency(amountAfterProductDiscount)}
            </span>
          </div>

          {couponDiscount > 0 && (
            <div className="flex justify-between">
              <span className="text-neutral-500">
                Coupon ({selectedOrder.couponCode || "DIWALI10"})
              </span>
              <span className="text-neutral-300">
                - {formatCurrency(couponDiscount)}
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-neutral-500">Shipping</span>
            <span className="text-neutral-300">
              {formatCurrency(shippingCharge)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-neutral-500">Tax</span>
            <span className="text-neutral-300">
              {formatCurrency(tax)}
            </span>
          </div>

          <div className="border-t border-[#292929] pt-3">
            <div className="flex justify-between">
              <span className="text-white">Total</span>
              <span className="text-lg text-white">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
})()}

                  {/* ==================================================
                      CANCELLATION INFORMATION
                  ================================================== */}

                  {selectedOrder.cancellationReason && (
                    <div className="border border-red-900/60 bg-red-950/20 p-5">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-red-500">
                        Cancellation Reason
                      </p>

                      <p className="mt-2 text-sm text-red-300">
                        {
                          selectedOrder.cancellationReason
                        }
                      </p>

                      {selectedOrder.cancelledAt && (
                        <p className="mt-1 text-xs text-red-500/70">
                          Cancelled on{" "}
                          {formatDateTime(
                            selectedOrder.cancelledAt
                          )}
                        </p>
                      )}
                    </div>
                  )}

                  {/* ==================================================
                      STATUS UPDATE
                  ================================================== */}

                  <div className="border-t border-[#292929] pt-6">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-600">
                      Order Status Management
                    </p>

                    {statusError && (
                      <div className="mt-4 border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                        {statusError}
                      </div>
                    )}

                    {returnError && (
                      <div className="mt-4 border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                        {returnError}
                      </div>
                    )}

                    {/* CANCELLATION REASON */}

                    {showCancelReason && (
                      <div className="mt-4 border border-[#303030] bg-[#111111] p-4">
                        <label className="mb-2 block text-xs text-neutral-400">
                          Cancellation reason
                          <span className="text-red-400">
                            {" "}
                            *
                          </span>
                        </label>

                        <textarea
                          value={cancelReason}
                          onChange={(event) =>
                            setCancelReason(
                              event.target.value
                            )
                          }
                          rows="3"
                          placeholder="Enter reason for cancelling this order..."
                          className="w-full resize-none border border-[#303030] bg-[#151515] px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-[#5a5a5a]"
                        />
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {getAllowedNextStatuses(
                        selectedOrder.orderStatus
                      ).map((nextStatus) => {
                        const isCancel =
                          nextStatus ===
                          "Cancelled";

                        return (
                          <button
                            key={nextStatus}
                            type="button"
                            disabled={updatingStatus}
                            onClick={() =>
                              handleStatusUpdate(
                                nextStatus
                              )
                            }
                            className={`border px-4 py-2.5 text-xs transition disabled:cursor-not-allowed disabled:opacity-40 ${
                              isCancel
                                ? "border-red-900 text-red-400 hover:bg-red-950/40"
                                : "border-[#3a3a3a] text-neutral-300 hover:bg-[#242424] hover:text-white"
                            }`}
                          >
                            {updatingStatus
                              ? "Updating..."
                              : isCancel &&
                                showCancelReason
                              ? "Confirm Cancellation"
                              : `Change to ${nextStatus}`}
                          </button>
                        );
                      })}

                      {getAllowedNextStatuses(
                        selectedOrder.orderStatus
                      ).length === 0 && (
                        <p className="text-xs text-neutral-600">
                          No further status changes
                          are available for this
                          order.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;