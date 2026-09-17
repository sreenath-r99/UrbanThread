import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getProducts,
  toggleProductStatus,
  deleteProduct,
} from "../../services/admin/productService";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProducts({
        search,
      });

      setProducts(response.products || []);
    } catch (error) {
      console.error("Fetch products error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to fetch products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const handleToggleStatus = async (productId) => {
    try {
      setActionLoading(productId);

      await toggleProductStatus(productId);

      await fetchProducts();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update product status"
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(productId);

      await deleteProduct(productId);

      setProducts((previousProducts) =>
        previousProducts.filter(
          (product) => product._id !== productId
        )
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete product"
      );
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] p-6 text-white">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-gray-500">
            Inventory Management
          </p>

          <h1 className="text-3xl font-semibold">
            Products
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Manage your UrbanThread product catalog.
          </p>
        </div>

        <Link
          to="/admin/products/add"
          className="rounded-lg bg-white px-5 py-3 text-center text-sm font-semibold text-black transition hover:bg-gray-200"
        >
          + Add Product
        </Link>
      </div>

      <div className="mb-6 rounded-2xl border border-white/10 bg-[#111827] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-medium">
              Product List
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Search and manage available products.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="w-full rounded-lg border border-white/10 bg-[#0b0f19] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-white/30 md:w-72"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-white/10 bg-white/[0.02]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Product
                </th>

                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Category
                </th>

                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Price
                </th>

                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Stock
                </th>

                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product._id}
                    className="transition hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 overflow-hidden rounded-lg border border-white/10 bg-[#0b0f19]">
                          {product.images?.[0]?.url ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-gray-600">
                              No image
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="font-medium text-white">
                            {product.name}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            ID: {product._id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-400">
                      {product.category?.name || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-300">
                      ₹{product.discountPrice || product.price}

                      {product.discountPrice && (
                        <span className="ml-2 text-xs text-gray-600 line-through">
                          ₹{product.price}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-400">
                      {product.stock}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          product.isActive
                            ? "bg-green-500/10 text-green-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {product.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/products/edit/${product._id}`}
                          className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 transition hover:bg-white/10"
                        >
                          Edit
                        </Link>

                        <button
                          onClick={() =>
                            handleToggleStatus(product._id)
                          }
                          disabled={
                            actionLoading === product._id
                          }
                          className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {product.isActive
                            ? "Disable"
                            : "Enable"}
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(product._id)
                          }
                          disabled={
                            actionLoading === product._id
                          }
                          className="rounded-lg border border-red-500/20 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;