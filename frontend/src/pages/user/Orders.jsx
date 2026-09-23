// frontend/src/pages/user/Orders.jsx

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
  cancelOrder,
  getOrders,
} from "../../services/orderService";

const Orders = () => {
  const navigate = useNavigate();

  const { token } =
    useContext(AuthContext);

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [cancellingOrderId, setCancellingOrderId] =
    useState("");

  const formatPrice = (value) =>
    `₹${Number(
      value || 0
    ).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "—";
    }

    return new Date(
      value
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const loadOrders =
    async () => {
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
          await getOrders(
            token
          );

        setOrders(
          Array.isArray(
            response?.orders
          )
            ? response.orders
            : []
        );
      } catch (error) {
        console.error(
          "LOAD ORDERS ERROR:",
          error
        );

        setError(
          error?.response?.data
            ?.message ||
            "Unable to load orders"
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void loadOrders();
  }, [token]);

  /*
  |--------------------------------------------------------------------
  | CANCEL ENTIRE ORDER
  |--------------------------------------------------------------------
  */

  const handleCancelOrder =
    async (order) => {
      if (
        !order ||
        order.orderStatus !==
          "Pending"
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `Are you sure you want to cancel order ${order.orderId}?`
        );

      if (!confirmed) {
        return;
      }

      const reason =
        window.prompt(
          "Enter a cancellation reason (optional):",
          ""
        );

      if (reason === null) {
        return;
      }

      try {
        setCancellingOrderId(
          order.orderId
        );

        setError("");

        const response =
          await cancelOrder(
            order.orderId,
            reason,
            token
          );

        const updatedOrder =
          response?.order;

        if (updatedOrder) {
          setOrders(
            (currentOrders) =>
              currentOrders.map(
                (currentOrder) =>
                  currentOrder.orderId ===
                  order.orderId
                    ? updatedOrder
                    : currentOrder
              )
          );
        } else {
          await loadOrders();
        }
      } catch (error) {
        console.error(
          "CANCEL ORDER ERROR:",
          error
        );

        setError(
          error?.response?.data
            ?.message ||
            "Unable to cancel order"
        );
      } finally {
        setCancellingOrderId("");
      }
    };

  const getStatusClass =
    (status) => {
      if (
        status ===
        "Delivered"
      ) {
        return "border-[#3d4d3d] text-neutral-300";
      }

      if (
        status ===
          "Cancelled"
      ) {
        return "border-red-900/60 text-red-400";
      }

      if (
        status ===
          "Partially Cancelled"
      ) {
        return "border-amber-900/60 text-amber-400";
      }

      return "border-[#454545] text-neutral-400";
    };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] text-white">
        <div className="mx-auto max-w-[1400px] px-6 py-20 lg:px-10">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Orders
          </p>

          <h1 className="mt-3 font-serif text-4xl">
            Loading orders...
          </h1>
        </div>
      </div>
    );
  }

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
              to="/cart"
              className="text-[10px] uppercase tracking-[0.15em] text-neutral-500 hover:text-white"
            >
              Cart
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
        <div className="border-b border-[#292929] pb-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Purchase History
          </p>

          <h1 className="mt-3 font-serif text-4xl text-[#e8e3dc]">
            My Orders
          </h1>

          <p className="mt-3 text-sm text-neutral-500">
            View your previous UrbanThread purchases and order details.
          </p>
        </div>

        {error && (
          <div className="mt-6 border border-red-900/50 bg-red-950/20 px-5 py-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {orders.length ===
        0 ? (
          <div className="mt-10 border border-dashed border-[#3a3a3a] bg-[#151515] p-12 text-center">
            <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-600">
              No Orders
            </p>

            <h2 className="mt-3 font-serif text-3xl text-[#e8e3dc]">
              You haven't placed an order yet.
            </h2>

            <Link
              to="/shop"
              className="mt-8 inline-flex bg-white px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-black hover:bg-neutral-200"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map(
              (order) => {
                const isCancelling =
                  cancellingOrderId ===
                  order.orderId;

                const canCancel =
                  order.orderStatus ===
                  "Pending";

                const activeItemCount =
                  order.items?.filter(
                    (item) =>
                      item.itemStatus !==
                      "Cancelled"
                  ).length || 0;

                const cancelledItemCount =
                  order.items?.filter(
                    (item) =>
                      item.itemStatus ===
                      "Cancelled"
                  ).length || 0;

                return (
                  <article
                    key={
                      order._id
                    }
                    className="border border-[#2b2b2b] bg-[#171717] p-6 transition hover:border-[#444444] sm:p-7"
                  >
                    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.16em] text-neutral-600">
                          Order ID
                        </p>

                        <h2 className="mt-2 font-serif text-xl text-[#e8e3dc]">
                          {
                            order.orderId
                          }
                        </h2>

                        <p className="mt-2 text-xs text-neutral-600">
                          Placed on{" "}
                          {formatDate(
                            order.createdAt
                          )}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <span
                          className={`border px-3 py-2 text-[9px] uppercase tracking-[0.13em] ${getStatusClass(
                            order.orderStatus
                          )}`}
                        >
                          {
                            order.orderStatus
                          }
                        </span>

                        <span className="text-lg text-white">
                          {formatPrice(
                            order.totalAmount
                          )}
                        </span>

                        <Link
                          to={`/orders/${order.orderId}`}
                          className="bg-white px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-black hover:bg-neutral-200"
                        >
                          View Details
                        </Link>

                        {canCancel && (
                          <button
                            type="button"
                            onClick={() =>
                              handleCancelOrder(
                                order
                              )
                            }
                            disabled={
                              isCancelling
                            }
                            className="border border-red-900/60 px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-red-400 transition hover:border-red-700 hover:bg-red-950/20 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isCancelling
                              ? "Cancelling..."
                              : "Cancel Order"}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 border-t border-[#292929] pt-6 sm:grid-cols-4">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.13em] text-neutral-600">
                          Items
                        </p>

                        <p className="mt-2 text-sm text-neutral-300">
                          {
                            order.items
                              ?.length ||
                            0
                          }{" "}
                          product
                          {(order.items
                            ?.length ||
                            0) ===
                          1
                            ? ""
                            : "s"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] uppercase tracking-[0.13em] text-neutral-600">
                          Active Items
                        </p>

                        <p className="mt-2 text-sm text-neutral-300">
                          {
                            activeItemCount
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] uppercase tracking-[0.13em] text-neutral-600">
                          Cancelled Items
                        </p>

                        <p className="mt-2 text-sm text-neutral-300">
                          {
                            cancelledItemCount
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] uppercase tracking-[0.13em] text-neutral-600">
                          Payment
                        </p>

                        <p className="mt-2 text-sm text-neutral-300">
                          {
                            order.paymentMethod
                          }
                        </p>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;