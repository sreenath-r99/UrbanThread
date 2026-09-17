import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../components/admin/AdminLayout";

import {
  getSubcategories,
  toggleSubcategoryStatus,
  deleteSubcategory,
} from "../../services/subcategoryService";

const Subcategories = () => {
  const navigate = useNavigate();

  const [subcategories, setSubcategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getSubcategories({
        search,
      });

      setSubcategories(response.subcategories || []);
    } catch (error) {
      console.error(
        "Fetch subcategories error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load subcategories"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubcategories();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleToggleStatus = async (subcategoryId) => {
    try {
      await toggleSubcategoryStatus(subcategoryId);
      await fetchSubcategories();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update subcategory status"
      );
    }
  };

  const handleDelete = async (subcategoryId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subcategory?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSubcategory(subcategoryId);
      await fetchSubcategories();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete subcategory"
      );
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-full bg-[#111111] px-6 py-6 text-white md:px-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-gray-500">
              Management
            </p>

            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Subcategories
            </h1>

            <p className="mt-1 text-xs text-gray-500">
              Create and manage product subcategories.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/subcategories/add")
            }
            className="w-fit bg-[#f1f0ed] px-5 py-3 text-[11px] font-semibold tracking-wide text-black transition hover:bg-white"
          >
            + Add Subcategory
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search subcategories..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="w-full max-w-sm border border-[#292929] bg-[#191919] px-4 py-3 text-xs text-white outline-none placeholder:text-gray-600 focus:border-gray-500"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 border border-red-900/60 bg-red-950/30 px-4 py-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto border border-[#242424] bg-[#171717]">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-[#292929] bg-[#1d1d1d]">
                <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
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

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-12 text-center text-xs text-gray-500"
                  >
                    Loading subcategories...
                  </td>
                </tr>
              ) : subcategories.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-12 text-center text-xs text-gray-500"
                  >
                    No subcategories found.
                  </td>
                </tr>
              ) : (
                subcategories.map(
                  (subcategory, index) => (
                    <tr
                      key={subcategory._id}
                      className="border-b border-[#242424] last:border-b-0 hover:bg-[#1c1c1c]"
                    >
                      <td className="px-4 py-4 text-xs text-gray-600">
                        {index + 1}
                      </td>

                      <td className="px-4 py-4 text-xs font-semibold text-white">
                        {subcategory.name}
                      </td>

                      <td className="px-4 py-4 text-xs text-gray-400">
                        {subcategory.category?.name ||
                          "Unknown"}
                      </td>

                      <td className="max-w-xs truncate px-4 py-4 text-xs text-gray-500">
                        {subcategory.description ||
                          "—"}
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleStatus(
                              subcategory._id
                            )
                          }
                          className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                            subcategory.isActive
                              ? "bg-green-950 text-green-400"
                              : "bg-red-950 text-red-400"
                          }`}
                        >
                          {subcategory.isActive
                            ? "Active"
                            : "Inactive"}
                        </button>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/subcategories/edit/${subcategory._id}`
                              )
                            }
                            className="border border-[#383838] px-3 py-1.5 text-[10px] text-gray-300 transition hover:border-gray-500 hover:text-white"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                subcategory._id
                              )
                            }
                            className="border border-red-950 px-3 py-1.5 text-[10px] text-red-400 transition hover:border-red-700 hover:text-red-300"
                          >
                            Delete
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
      </div>
    </AdminLayout>
  );
};

export default Subcategories;