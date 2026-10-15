
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

function getAuthToken() {
  return localStorage.getItem("token");
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function Wallet() {
  const [wallet, setWallet] = useState({
    balance: 0,
    transactions: [],
    pagination: { page: 1, limit: 10, total: 0, pages: 0 },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWallet = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");

    try {
      const token = getAuthToken();

      const response = await axios.get(`${API_URL}/wallet`, {
        params: { page, limit: 10 },
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
        withCredentials: true,
      });

      setWallet(response.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your wallet. Please log in again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  if (loading) {
    return (
      <main className="mx-auto min-h-[60vh] max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-5">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="h-40 rounded-2xl bg-gray-200" />
          <div className="h-64 rounded-2xl bg-gray-100" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page heading */}
      <header className="mb-8">
        <p className="mb-2 text-xs font-bold tracking-[0.2em] text-gray-500">
          MY ACCOUNT
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          My Wallet
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
          Manage your wallet balance, order refunds, and transaction history.
        </p>
      </header>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
          <button
            type="button"
            onClick={() => fetchWallet()}
            className="ml-3 font-semibold underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      )}

      {!error && (
        <>
          {/* Balance card */}
          <section className="relative overflow-hidden rounded-2xl bg-gray-950 p-6 text-white shadow-lg sm:p-9">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[35px] border-white/5"
            />

            <div className="relative flex items-center justify-between gap-5">
              <div>
                <p className="text-sm font-medium text-gray-300">
                  Available Wallet Balance
                </p>

                <p className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
                  {formatMoney(wallet.balance)}
                </p>

                <p className="mt-4 text-sm text-gray-400">
                  Use your balance toward eligible UrbanThread orders.
                </p>
              </div>

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-2xl font-bold sm:h-20 sm:w-20 sm:text-4xl">
                ₹
              </div>
            </div>
          </section>

          {/* Transaction history */}
          <section className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="flex flex-col gap-2 border-b border-gray-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Transaction History
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Your wallet credits, refunds, and payments.
                </p>
              </div>

              <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                {wallet.pagination.total} transactions
              </span>
            </div>

            {wallet.transactions.length === 0 ? (
              <div className="px-5 py-16 text-center sm:px-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl font-semibold text-gray-700">
                  ₹
                </div>

                <h3 className="mt-5 text-base font-semibold text-gray-900">
                  No transactions yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  When a cancellation refund, approved return refund, or wallet
                  payment is processed, its details will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Transaction</th>
                      <th className="px-6 py-4 font-semibold">Date</th>
                      <th className="px-6 py-4 font-semibold">Type</th>
                      <th className="px-6 py-4 font-semibold">Amount</th>
                      <th className="px-6 py-4 font-semibold">Balance after</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {wallet.transactions.map((transaction) => (
                      <tr
                        key={transaction._id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">
                            {transaction.category}
                          </p>
                          <p className="mt-1 max-w-xs break-words text-xs text-gray-500">
                            {transaction.description ||
                              transaction.referenceId}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                          {new Date(transaction.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              transaction.type === "Credit"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </td>

                        <td
                          className={`whitespace-nowrap px-6 py-4 font-semibold ${
                            transaction.type === "Credit"
                              ? "text-emerald-700"
                              : "text-red-700"
                          }`}
                        >
                          {transaction.type === "Credit" ? "+" : "-"}
                          {formatMoney(transaction.amount)}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-700">
                          {formatMoney(transaction.balanceAfter)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {wallet.pagination.pages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-4 border-t border-gray-200 px-5 py-4">
                <button
                  type="button"
                  disabled={wallet.pagination.page <= 1}
                  onClick={() => fetchWallet(wallet.pagination.page - 1)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-500">
                  Page {wallet.pagination.page} of {wallet.pagination.pages}
                </span>

                <button
                  type="button"
                  disabled={
                    wallet.pagination.page >= wallet.pagination.pages
                  }
                  onClick={() => fetchWallet(wallet.pagination.page + 1)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default Wallet;