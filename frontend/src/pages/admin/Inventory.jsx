import {
  useEffect,
  useState,
} from "react";

import {
  getInventory,
  updateInventoryStock,
} from "../../services/admin/inventoryService.js";

const STATUS_OPTIONS = [
  "All",
  "In Stock",
  "Low Stock",
  "Out of Stock",
];

const Inventory = () => {
  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    stats,
    setStats,
  ] = useState({
    totalProducts: 0,
    totalUnits: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
  });

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("");

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    pagination,
    setPagination,
  ] = useState({
    currentPage: 1,
    totalPages: 0,
    totalProducts: 0,
    limit: 10,
  });

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    editingProduct,
    setEditingProduct,
  ] = useState(null);

  const [
    editSizes,
    setEditSizes,
  ] = useState([]);

  const [
    editStock,
    setEditStock,
  ] = useState("");

  const [
    saving,
    setSaving,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | FETCH INVENTORY
  |--------------------------------------------------------------------------
  */

  const fetchInventory =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getInventory({
            page,
            limit: 10,
            search,
            status,
          });

        setProducts(
          response.products || []
        );

        setStats(
          response.stats || {
            totalProducts: 0,
            totalUnits: 0,
            lowStockProducts: 0,
            outOfStockProducts: 0,
          }
        );

        setPagination(
          response.pagination || {}
        );
      } catch (error) {
        console.error(
          "FETCH INVENTORY ERROR:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Failed to load inventory"
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    const timer =
      setTimeout(() => {
        fetchInventory();
      }, 350);

    return () =>
      clearTimeout(timer);
  }, [
    page,
    search,
    status,
  ]);

  /*
  |--------------------------------------------------------------------------
  | OPEN EDIT
  |--------------------------------------------------------------------------
  */

  const openEdit = (
    product
  ) => {
    setEditingProduct(
      product
    );

    if (
      Array.isArray(
        product.sizes
      ) &&
      product.sizes.length > 0
    ) {
      setEditSizes(
        product.sizes.map(
          (item) => ({
            size: item.size,
            stock:
              item.stock,
          })
        )
      );

      setEditStock("");
    } else {
      setEditSizes([]);
      setEditStock(
        product.stock
      );
    }

    setError("");
    setSuccess("");
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE EDIT
  |--------------------------------------------------------------------------
  */

  const closeEdit = () => {
    if (saving) {
      return;
    }

    setEditingProduct(null);
    setEditSizes([]);
    setEditStock("");
  };

  /*
  |--------------------------------------------------------------------------
  | CHANGE SIZE STOCK
  |--------------------------------------------------------------------------
  */

  const handleSizeStockChange =
    (
      size,
      value
    ) => {
      setEditSizes(
        (previous) =>
          previous.map(
            (item) =>
              item.size === size
                ? {
                    ...item,
                    stock: value,
                  }
                : item
          )
      );
    };

  /*
  |--------------------------------------------------------------------------
  | SAVE STOCK
  |--------------------------------------------------------------------------
  */

  const handleSave =
    async () => {
      if (!editingProduct) {
        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        let data;

        if (
          editSizes.length > 0
        ) {
          data = {
            sizes:
              editSizes.map(
                (item) => ({
                  size:
                    item.size,
                  stock:
                    Number(
                      item.stock
                    ),
                })
              ),
          };
        } else {
          data = {
            stock:
              Number(
                editStock
              ),
          };
        }

        await updateInventoryStock(
          editingProduct._id,
          data
        );

        setSuccess(
          "Stock updated successfully"
        );

        closeEdit();

        await fetchInventory();
      } catch (error) {
        console.error(
          "SAVE STOCK ERROR:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Failed to update stock"
        );
      } finally {
        setSaving(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | FORMAT IMAGE
  |--------------------------------------------------------------------------
  */

  const getImageUrl =
    (product) => {
      return (
        product?.images?.[0]
          ?.url || ""
      );
    };

  /*
  |--------------------------------------------------------------------------
  | STOCK BADGE
  |--------------------------------------------------------------------------
  */

  const getStatusClass =
    (stockStatus) => {
      if (
        stockStatus ===
        "Out of Stock"
      ) {
        return "border-red-500/20 bg-red-500/10 text-red-400";
      }

      if (
        stockStatus ===
        "Low Stock"
      ) {
        return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";
      }

      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
    };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-[#111111] p-6 text-white md:p-8">

      {/* HEADER */}

      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
          Inventory Management
        </p>

        <h1 className="mt-2 text-3xl font-semibold">
          Stock
        </h1>

        <p className="mt-2 text-sm text-neutral-500">
          Monitor and manage UrbanThread product inventory.
        </p>
      </div>

      {/* STATS */}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl border border-white/10 bg-[#181818] p-5">
          <p className="text-xs uppercase tracking-wider text-neutral-500">
            Products
          </p>

          <p className="mt-3 text-2xl font-semibold">
            {stats.totalProducts}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#181818] p-5">
          <p className="text-xs uppercase tracking-wider text-neutral-500">
            Total Units
          </p>

          <p className="mt-3 text-2xl font-semibold">
            {stats.totalUnits}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#181818] p-5">
          <p className="text-xs uppercase tracking-wider text-neutral-500">
            Low Stock
          </p>

          <p className="mt-3 text-2xl font-semibold text-yellow-400">
            {stats.lowStockProducts}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#181818] p-5">
          <p className="text-xs uppercase tracking-wider text-neutral-500">
            Out of Stock
          </p>

          <p className="mt-3 text-2xl font-semibold text-red-400">
            {stats.outOfStockProducts}
          </p>
        </div>

      </div>

      {/* FILTERS */}

      <div className="mb-6 rounded-xl border border-white/10 bg-[#181818] p-5">

        <div className="flex flex-col gap-4 md:flex-row">

          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(
                event.target.value
              );
              setPage(1);
            }}
            placeholder="Search products..."
            className="flex-1 rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-white/30"
          />

          <select
            value={
              status || "All"
            }
            onChange={(event) => {
              const value =
                event.target.value;

              setStatus(
                value === "All"
                  ? ""
                  : value
              );

              setPage(1);
            }}
            className="rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none"
          >
            {STATUS_OPTIONS.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}
          </select>

        </div>

      </div>

      {/* MESSAGES */}

      {error && (
        <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          {success}
        </div>
      )}

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#181818]">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px] text-left">

            <thead className="border-b border-white/10">

              <tr className="text-xs uppercase tracking-wider text-neutral-500">

                <th className="px-5 py-4">
                  Product
                </th>

                <th className="px-5 py-4">
                  Category
                </th>

                <th className="px-5 py-4">
                  Size Stock
                </th>

                <th className="px-5 py-4">
                  Total
                </th>

                <th className="px-5 py-4">
                  Status
                </th>

                <th className="px-5 py-4 text-right">
                  Action
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-white/5">

              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-16 text-center text-sm text-neutral-500"
                  >
                    Loading inventory...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-16 text-center text-sm text-neutral-500"
                  >
                    No inventory items found.
                  </td>
                </tr>
              ) : (
                products.map(
                  (product) => (
                    <tr
                      key={
                        product._id
                      }
                      className="hover:bg-white/[0.02]"
                    >

                      <td className="px-5 py-5">

                        <div className="flex items-center gap-3">

                          <div className="h-12 w-12 overflow-hidden rounded-lg bg-[#111111]">

                            {getImageUrl(
                              product
                            ) ? (
                              <img
                                src={getImageUrl(
                                  product
                                )}
                                alt={
                                  product.name
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : null}

                          </div>

                          <div>
                            <p className="text-sm font-medium text-white">
                              {product.name}
                            </p>

                            {!product.isActive && (
                              <p className="mt-1 text-xs text-neutral-600">
                                Inactive
                              </p>
                            )}
                          </div>

                        </div>

                      </td>

                      <td className="px-5 py-5 text-sm text-neutral-400">
                        {product.category?.name ||
                          "—"}
                      </td>

                      <td className="px-5 py-5">

                        {product.sizes?.length ? (
                          <div className="flex flex-wrap gap-2">

                            {product.sizes.map(
                              (item) => (
                                <span
                                  key={
                                    item.size
                                  }
                                  className="rounded border border-white/10 bg-[#111111] px-2 py-1 text-xs text-neutral-300"
                                >
                                  {item.size}:{" "}
                                  {item.stock}
                                </span>
                              )
                            )}

                          </div>
                        ) : (
                          <span className="text-sm text-neutral-400">
                            No size variants
                          </span>
                        )}

                      </td>

                      <td className="px-5 py-5 text-sm font-medium">
                        {product.stock}
                      </td>

                      <td className="px-5 py-5">

                        <span
                          className={`rounded-full border px-3 py-1 text-[11px] ${getStatusClass(
                            product.stockStatus
                          )}`}
                        >
                          {product.stockStatus}
                        </span>

                      </td>

                      <td className="px-5 py-5 text-right">

                        <button
                          type="button"
                          onClick={() =>
                            openEdit(
                              product
                            )
                          }
                          className="rounded-lg border border-white/10 px-4 py-2 text-xs text-neutral-300 transition hover:bg-white/5 hover:text-white"
                        >
                          Edit Stock
                        </button>

                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* PAGINATION */}

      {pagination.totalPages >
        1 && (
        <div className="mt-6 flex items-center justify-between">

          <p className="text-xs text-neutral-600">
            Page{" "}
            {pagination.currentPage}{" "}
            of{" "}
            {pagination.totalPages}
          </p>

          <div className="flex gap-2">

            <button
              type="button"
              disabled={
                page <= 1
              }
              onClick={() =>
                setPage(
                  (current) =>
                    Math.max(
                      1,
                      current - 1
                    )
                )
              }
              className="rounded-lg border border-white/10 px-4 py-2 text-xs text-neutral-400 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={
                page >=
                pagination.totalPages
              }
              onClick={() =>
                setPage(
                  (current) =>
                    Math.min(
                      pagination.totalPages,
                      current + 1
                    )
                )
              }
              className="rounded-lg border border-white/10 px-4 py-2 text-xs text-neutral-400 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
            </button>

          </div>

        </div>
      )}

      {/* EDIT MODAL */}

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#181818] shadow-2xl">

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

              <div>
                <h2 className="text-lg font-semibold">
                  Edit Stock
                </h2>

                <p className="mt-1 text-xs text-neutral-500">
                  {editingProduct.name}
                </p>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                className="text-xl text-neutral-500 hover:text-white"
              >
                ×
              </button>

            </div>

            <div className="space-y-5 p-6">

              {editSizes.length >
              0 ? (
                <div className="space-y-4">

                  {editSizes.map(
                    (item) => (
                      <div
                        key={
                          item.size
                        }
                      >

                        <label className="mb-2 block text-xs uppercase tracking-wider text-neutral-500">
                          Size{" "}
                          {item.size}
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={
                            item.stock
                          }
                          onChange={(
                            event
                          ) =>
                            handleSizeStockChange(
                              item.size,
                              event.target.value
                            )
                          }
                          className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                        />

                      </div>
                    )
                  )}

                </div>
              ) : (
                <div>

                  <label className="mb-2 block text-xs uppercase tracking-wider text-neutral-500">
                    Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      editStock
                    }
                    onChange={(
                      event
                    ) =>
                      setEditStock(
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                  />

                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">

                <button
                  type="button"
                  onClick={
                    closeEdit
                  }
                  disabled={saving}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-neutral-400 hover:bg-white/5 disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleSave
                  }
                  disabled={saving}
                  className="rounded-lg bg-white px-5 py-2 text-sm font-medium text-black hover:bg-neutral-200 disabled:opacity-40"
                >
                  {saving
                    ? "Saving..."
                    : "Save Stock"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Inventory;