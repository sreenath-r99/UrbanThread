import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getCategories,
  deleteCategory,
  toggleCategoryStatus,
} from "../../services/categoryService";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCategories(search);

      setCategories(response.categories || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load categories"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [search]);

  const handleDelete = async (categoryId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    try {
      await deleteCategory(categoryId);
      await fetchCategories();
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to delete category"
      );
    }
  };

  const handleToggleStatus = async (categoryId) => {
    try {
      await toggleCategoryStatus(categoryId);
      await fetchCategories();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to update category status"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] px-6 py-8 text-white md:px-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-gray-500">
            Management
          </p>

          <h1 className="text-3xl font-semibold">Categories</h1>

          <p className="mt-2 text-sm text-gray-400">
            Create and manage product categories.
          </p>
        </div>

        <Link
          to="/admin/categories/add"
          className="rounded-lg bg-white px-5 py-3 text-center text-sm font-semibold text-black transition hover:bg-gray-200"
        >
          + Add Category
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full max-w-md rounded-lg border border-[#333333] bg-[#1b1b1b] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-white"
        />
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[#2c2c2c] bg-[#181818]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
            <thead className="border-b border-[#2c2c2c] bg-[#202020]">
              <tr>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-400">
                  #
                </th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-400">
                  Category
                </th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-400">
                  Description
                </th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-400">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs uppercase tracking-wider text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((category, index) => (
                  <tr
                    key={category._id}
                    className="border-b border-[#2c2c2c] last:border-b-0"
                  >
                    <td className="px-6 py-5 text-sm text-gray-500">
                      {index + 1}
                    </td>

                    <td className="px-6 py-5">
                      <p className="font-medium">{category.name}</p>
                    </td>

                    <td className="max-w-xs px-6 py-5 text-sm text-gray-400">
                      {category.description || "No description"}
                    </td>

                    <td className="px-6 py-5">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleStatus(category._id)
                        }
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          category.isActive
                            ? "bg-green-950 text-green-400"
                            : "bg-red-950 text-red-400"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-3">
                        <Link
                          to={`/admin/categories/edit/${category._id}`}
                          className="rounded-md border border-[#444444] px-3 py-2 text-xs text-gray-300 transition hover:border-white hover:text-white"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(category._id)
                          }
                          className="rounded-md border border-red-900 px-3 py-2 text-xs text-red-400 transition hover:bg-red-950"
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

export default Categories;