// frontend/src/pages/user/OrderDetails.jsx

import {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";

import {
  cancelOrder,
  cancelOrderItem,
  getOrder,
} from "../../services/orderService";

const OrderDetails = () => {
  const navigate = useNavigate();

  const { orderId } =
    useParams();

  const { token } =
    useContext(AuthContext);

  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [cancelling, setCancelling] =
    useState(false);

  const [cancellingItemId, setCancellingItemId] =
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
        month: "long",
        year: "numeric",
      }
    );
  };

  const getImageUrl = (
    item
  ) => {
    if (
      item?.productImage
    ) {
      return item.productImage;
    }

    const images =
      item?.product?.images;

    const image =
      images?.[0];

    if (!image) {
      return "";
    }

    if (
      typeof image === "string"
    ) {
      return image;
    }

    return image.url || "";
  };

  /*
  |--------------------------------------------------------------------
  | LOAD ORDER
  |--------------------------------------------------------------------
  */

  const loadOrder =
    async () => {
      if (
        !token ||
        !orderId
      ) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await getOrder(
            orderId,
            token
          );

        setOrder(
          response?.order ||
            null
        );
      } catch (error) {
        console.error(
          "LOAD ORDER DETAILS ERROR:",
          error
        );

        setError(
          error?.response?.data
            ?.message ||
            "Unable to load order"
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void loadOrder();
  }, [
    token,
    orderId,
  ]);

  /*
  |--------------------------------------------------------------------
  | CANCEL ENTIRE ORDER
  |--------------------------------------------------------------------
  */

  const handleCancelOrder =
    async () => {
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
        setCancelling(true);
        setError("");

        const response =
          await cancelOrder(
            order.orderId,
            reason,
            token
          );

        if (
          response?.order
        ) {
          setOrder(
            response.order
          );
        } else {
          await loadOrder();
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
        setCancelling(false);
      }
    };

  /*
  |--------------------------------------------------------------------
  | CANCEL SPECIFIC PRODUCT
  |--------------------------------------------------------------------
  */

  const handleCancelItem =
    async (item) => {
      if (
        !order ||
        !item ||
        item.itemStatus ===
          "Cancelled"
      ) {
        return;
      }

      if (
        ![
          "Pending",
          "Partially Cancelled",
        ].includes(
          order.orderStatus
        )
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `Are you sure you want to cancel ${item.productName} (${item.size})?`
        );

      if (!confirmed) {
        return;
      }

      const reason =
        window.prompt(
          `Enter a cancellation reason for ${item.productName} (optional):`,
          ""
        );

      if (reason === null) {
        return;
      }

      try {
        setCancellingItemId(
          item._id
        );

        setError("");

        const response =
          await cancelOrderItem(
            order.orderId,
            item._id,
            reason,
            token
          );

        if (
          response?.order
        ) {
          setOrder(
            response.order
          );
        } else {
          await loadOrder();
        }
      } catch (error) {
        console.error(
          "CANCEL ORDER ITEM ERROR:",
          error
        );

        setError(
          error?.response?.data
            ?.message ||
            "Unable to cancel product"
        );
      } finally {
        setCancellingItemId("");
      }
    };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111111] text-white">
        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          Loading order...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#111111] px-6 py-20 text-white">
        <div className="mx-auto max-w-2xl border border-red-900/50 bg-red-950/20 p-8 text-center">
          <p className="text-sm text-red-400">
            {error ||
              "Order not found"}
          </p>

          <Link
            to="/orders"
            className="mt-6 inline-flex bg-white px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-black"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const address =
    order.shippingAddress;

  const canCancelOrder =
    order.orderStatus ===
    "Pending";

  const canCancelItems = [
    "Pending",
    "Partially Cancelled",
  ].includes(
    order.orderStatus
  );

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
              to="/orders"
              className="text-[10px] uppercase tracking-[0.15em] text-neutral-500 hover:text-white"
            >
              My Orders
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10 lg:py-14">
        <div className="flex flex-col justify-between gap-5 border-b border-[#292929] pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              Order Details
            </p>

            <h1 className="mt-3 font-serif text-4xl text-[#e8e3dc]">
              {
                order.orderId
              }
            </h1>

            <p className="mt-3 text-sm text-neutral-500">
              Placed on{" "}
              {formatDate(
                order.createdAt
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`w-fit border px-4 py-3 text-[9px] uppercase tracking-[0.14em] ${
                order.orderStatus ===
                "Cancelled"
                  ? "border-red-900/60 text-red-400"
                  : order.orderStatus ===
                    "Partially Cancelled"
                  ? "border-amber-900/60 text-amber-400"
                  : order.orderStatus ===
                    "Delivered"
                  ? "border-[#3d4d3d] text-neutral-300"
                  : "border-[#454545] text-neutral-300"
              }`}
            >
              {
                order.orderStatus
              }
            </span>

            {canCancelOrder && (
              <button
                type="button"
                onClick={
                  handleCancelOrder
                }
                disabled={
                  cancelling
                }
                className="border border-red-900/60 px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-red-400 transition hover:border-red-700 hover:bg-red-950/20 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancelling
                  ? "Cancelling..."
                  : "Cancel Order"}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-6 border border-red-900/50 bg-red-950/20 px-5 py-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {order.orderStatus ===
          "Cancelled" &&
          order.cancellationReason && (
            <div className="mt-6 border border-red-900/40 bg-red-950/10 px-5 py-4">
              <p className="text-[9px] uppercase tracking-[0.15em] text-red-500">
                Cancellation Reason
              </p>

              <p className="mt-2 text-sm text-neutral-400">
                {
                  order.cancellationReason
                }
              </p>

              {order.cancelledAt && (
                <p className="mt-2 text-xs text-neutral-600">
                  Cancelled on{" "}
                  {formatDate(
                    order.cancelledAt
                  )}
                </p>
              )}
            </div>
          )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-8">
            <section className="border border-[#2b2b2b] bg-[#171717] p-6 sm:p-7">
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                Products
              </p>

              <h2 className="mt-2 font-serif text-2xl text-[#e8e3dc]">
                Order Items
              </h2>

              <div className="mt-7 divide-y divide-[#292929]">
                {order.items?.map(
                  (item) => {
                    const imageUrl =
                      getImageUrl(
                        item
                      );

                    const isCancelled =
                      item.itemStatus ===
                      "Cancelled";

                    const isCancellingItem =
                      cancellingItemId ===
                      item._id;

                    return (
                      <div
                        key={
                          item._id
                        }
                        className={`flex gap-5 py-6 first:pt-0 last:pb-0 ${
                          isCancelled
                            ? "opacity-60"
                            : ""
                        }`}
                      >
                        <div className="h-28 w-20 shrink-0 overflow-hidden bg-[#222222] sm:h-32 sm:w-24">
                          {imageUrl ? (
                            <img
                              src={
                                imageUrl
                              }
                              alt={
                                item.productName ||
                                "Product"
                              }
                              className={`h-full w-full object-cover ${
                                isCancelled
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[8px] uppercase text-neutral-600">
                              No Image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col justify-between gap-3 sm:flex-row">
                            <div>
                              <h3 className="font-serif text-xl text-[#e8e3dc]">
                                {
                                  item.productName
                                }
                              </h3>

                              {isCancelled && (
                                <span className="mt-2 inline-flex border border-red-900/60 px-3 py-1.5 text-[8px] uppercase tracking-[0.15em] text-red-400">
                                  Cancelled
                                </span>
                              )}
                            </div>

                            <div className="text-left sm:text-right">
                              <p className="text-[9px] uppercase tracking-[0.13em] text-neutral-600">
                                Total
                              </p>

                              <p className="mt-2 text-sm text-white">
                                {formatPrice(
                                  item.itemTotal
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 space-y-1 text-xs text-neutral-500">
                            <p>
                              Size:{" "}
                              {
                                item.size
                              }
                            </p>

                            <p>
                              Quantity:{" "}
                              {
                                item.quantity
                              }
                            </p>

                            <p>
                              Price:{" "}
                              {formatPrice(
                                item.price
                              )}
                            </p>
                          </div>

                          {isCancelled &&
                            item.cancellationReason && (
                              <div className="mt-4 border border-red-900/30 bg-red-950/10 px-4 py-3">
                                <p className="text-[8px] uppercase tracking-[0.15em] text-red-500">
                                  Cancellation Reason
                                </p>

                                <p className="mt-1 text-xs text-neutral-500">
                                  {
                                    item.cancellationReason
                                  }
                                </p>

                                {item.cancelledAt && (
                                  <p className="mt-1 text-[10px] text-neutral-700">
                                    Cancelled on{" "}
                                    {formatDate(
                                      item.cancelledAt
                                    )}
                                  </p>
                                )}
                              </div>
                            )}

                          {!isCancelled &&
                            canCancelItems && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleCancelItem(
                                    item
                                  )
                                }
                                disabled={
                                  isCancellingItem ||
                                  cancelling
                                }
                                className="mt-5 border border-red-900/60 px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-red-400 transition hover:border-red-700 hover:bg-red-950/20 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isCancellingItem
                                  ? "Cancelling..."
                                  : "Cancel Item"}
                              </button>
                            )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </section>

            <section className="border border-[#2b2b2b] bg-[#171717] p-6 sm:p-7">
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                Delivery
              </p>

              <h2 className="mt-2 font-serif text-2xl text-[#e8e3dc]">
                Shipping Address
              </h2>

              {address && (
                <div className="mt-6 border border-[#292929] bg-[#141414] p-5">
                  <p className="text-sm font-medium text-white">
                    {
                      address.fullName
                    }
                  </p>

                  <p className="mt-3 text-sm leading-6 text-neutral-500">
                    {
                      address.houseName
                    }
                    ,{" "}
                    {
                      address.street
                    }
                    ,{" "}
                    {
                      address.city
                    }
                    ,{" "}
                    {
                      address.state
                    }{" "}
                    -{" "}
                    {
                      address.pincode
                    }
                  </p>

                  <p className="mt-2 text-xs text-neutral-600">
                    {
                      address.phone
                    }
                  </p>
                </div>
              )}
            </section>

            <section className="border border-[#2b2b2b] bg-[#171717] p-6 sm:p-7">
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                Payment
              </p>

              <h2 className="mt-2 font-serif text-2xl text-[#e8e3dc]">
                Payment Information
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="border border-[#292929] bg-[#141414] p-5">
                  <p className="text-[9px] uppercase tracking-[0.13em] text-neutral-600">
                    Method
                  </p>

                  <p className="mt-2 text-sm text-white">
                    {
                      order.paymentMethod
                    }
                  </p>
                </div>

                <div className="border border-[#292929] bg-[#141414] p-5">
                  <p className="text-[9px] uppercase tracking-[0.13em] text-neutral-600">
                    Payment Status
                  </p>

                  <p className="mt-2 text-sm text-white">
                    {
                      order.paymentStatus
                    }
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside className="h-fit border border-[#2b2b2b] bg-[#171717] p-6 sm:p-7 lg:sticky lg:top-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              Summary
            </p>

            <h2 className="mt-3 font-serif text-2xl text-[#e8e3dc]">
              Price Summary
            </h2>

            <div className="mt-7 space-y-4 border-b border-[#292929] pb-6">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">
                  Subtotal
                </span>

                <span className="text-neutral-300">
                  {formatPrice(
                    order.subtotal
                  )}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">
                  Discount
                </span>

                <span className="text-neutral-300">
                  {order.discount >
                  0
                    ? `-${formatPrice(
                        order.discount
                      )}`
                    : "—"}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">
                  Shipping
                </span>

                <span className="text-neutral-300">
                  {order.shippingCharge ===
                  0
                    ? "Free"
                    : formatPrice(
                        order.shippingCharge
                      )}
                </span>
              </div>

              {order.tax >
                0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">
                    Tax
                  </span>

                  <span className="text-neutral-300">
                    {formatPrice(
                      order.tax
                    )}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-end justify-between gap-4 py-6">
              <span className="text-[10px] uppercase tracking-[0.15em] text-neutral-500">
                Total
              </span>

              <span className="text-2xl text-white">
                {formatPrice(
                  order.totalAmount
                )}
              </span>
            </div>

            {canCancelOrder && (
              <button
                type="button"
                onClick={
                  handleCancelOrder
                }
                disabled={
                  cancelling
                }
                className="mb-4 flex w-full items-center justify-center border border-red-900/60 px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.17em] text-red-400 transition hover:border-red-700 hover:bg-red-950/20 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancelling
                  ? "Cancelling Order..."
                  : "Cancel Order"}
              </button>
            )}

            <Link
              to="/orders"
              className="flex w-full items-center justify-center border border-[#3a3a3a] px-5 py-4 text-[10px] uppercase tracking-[0.17em] text-neutral-400 hover:border-[#666666] hover:text-white"
            >
              Back to Orders
            </Link>

            <Link
              to="/shop"
              className="mt-4 flex w-full items-center justify-center bg-white px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.17em] text-black hover:bg-neutral-200"
            >
              Continue Shopping
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default OrderDetails;