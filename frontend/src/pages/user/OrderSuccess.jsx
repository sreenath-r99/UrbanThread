import { useContext, useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";

import { getOrder } from "../../services/orderService";

const OrderSuccess = () => {
  const { orderId } = useParams();

  const { token } = useContext(AuthContext);

  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const formatPrice = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  useEffect(() => {
    const loadOrder = async () => {
      if (!token || !orderId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getOrder(orderId, token);

        setOrder(response?.order || null);
      } catch (error) {
        console.error("LOAD SUCCESS ORDER ERROR:", error);

        setError(error?.response?.data?.message || "Unable to load order");
      } finally {
        setLoading(false);
      }
    };

    void loadOrder();
  }, [token, orderId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111111] text-white">
        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          Loading order...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#111111] px-6 py-20 text-white">
        <div className="mx-auto max-w-2xl border border-red-900/50 bg-red-950/20 p-8 text-center">
          <p className="text-sm text-red-400">{error}</p>

          <Link
            to="/orders"
            className="mt-6 inline-flex bg-white px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-black"
          >
            View Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <header className="border-b border-[#262626] bg-[#151515]">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-10">
          <Link to="/home" className="font-serif text-lg tracking-wide">
            UrbanThread
          </Link>

          <Link
            to="/orders"
            className="text-[10px] uppercase tracking-[0.15em] text-neutral-500 hover:text-white"
          >
            My Orders
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-[900px] justify-center px-6 py-16 lg:py-24">
        <div className="w-full border border-[#2b2b2b] bg-[#171717] p-8 text-center sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#555555]">
            <span className="text-2xl text-white">✓</span>
          </div>

          <p className="mt-8 text-[10px] uppercase tracking-[0.22em] text-neutral-500">
            Order Confirmed
          </p>

          <h1 className="mt-3 font-serif text-4xl text-[#e8e3dc]">
            Thank You For Your Order
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-neutral-500">
            Your UrbanThread order has been successfully placed. We will process
            your order and prepare it for delivery.
          </p>

          {order && (
            <div className="mx-auto mt-8 max-w-md border border-[#292929] bg-[#141414] p-5 text-left">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-neutral-500">Order ID</span>

                <span className="text-white">{order.orderId}</span>
              </div>

              <div className="mt-4 flex justify-between gap-4 text-sm">
                <span className="text-neutral-500">Payment</span>

                <span className="text-white">Cash on Delivery</span>
              </div>

              <div className="mt-4 flex justify-between gap-4 text-sm">
                <span className="text-neutral-500">Total</span>

                <span className="text-white">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to={`/orders/${orderId}`}
              className="bg-white px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-black hover:bg-neutral-200"
            >
              View Order Details
            </Link>

            <Link
              to="/shop"
              className="border border-[#3a3a3a] px-7 py-4 text-[10px] uppercase tracking-[0.15em] text-neutral-400 hover:border-[#666666] hover:text-white"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderSuccess;
