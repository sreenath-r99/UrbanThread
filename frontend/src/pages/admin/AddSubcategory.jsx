import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../components/admin/AdminLayout";

import { createSubcategory } from "../../services/subcategoryService";

import { getCategories } from "../../services/categoryService";

const AddSubcategory = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();

        setCategories(response.categories || []);
      } catch (error) {
        console.error("Fetch categories error:", error);

        setError(error.response?.data?.message || "Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.name.trim()) {
      setError("Subcategory name is required");
      return;
    }

    if (!formData.category) {
      setError("Please select a parent category");
      return;
    }

    try {
      setLoading(true);

      await createSubcategory({
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        isActive: formData.isActive,
      });

      navigate("/admin/subcategories", {
        replace: true,
      });
    } catch (error) {
      console.error("Create subcategory error:", error);

      setError(error.response?.data?.message || "Failed to create subcategory");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-full bg-[#111111] px-6 py-6 text-white md:px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-gray-500">
            Management
          </p>

          <h1 className="text-2xl font-semibold tracking-tight">
            Add Subcategory
          </h1>

          <p className="mt-1 text-xs text-gray-500">
            Create a new product subcategory.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl border border-[#292929] bg-[#171717] p-6 md:p-8"
        >
          {error && (
            <div className="mb-6 border border-red-900/60 bg-red-950/30 px-4 py-3 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="mb-5">
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Subcategory Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter subcategory name"
              className="w-full border border-[#303030] bg-[#1d1d1d] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-gray-500"
            />
          </div>

          {/* Parent Category */}
          <div className="mb-5">
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Parent Category
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={categoriesLoading}
              className="w-full border border-[#303030] bg-[#1d1d1d] px-4 py-3 text-sm text-white outline-none focus:border-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {categoriesLoading
                  ? "Loading categories..."
                  : "Select parent category"}
              </option>

              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              placeholder="Enter subcategory description"
              className="w-full resize-none border border-[#303030] bg-[#1d1d1d] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-gray-500"
            />
          </div>

          {/* Status */}
          <div className="mb-8 flex items-center gap-3">
            <input
              id="isActive"
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 accent-white"
            />

            <label htmlFor="isActive" className="text-xs text-gray-400">
              Active subcategory
            </label>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#f1f0ed] px-6 py-3 text-xs font-semibold tracking-wide text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Subcategory"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/subcategories")}
              className="border border-[#383838] px-6 py-3 text-xs text-gray-300 transition hover:border-gray-500 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddSubcategory;
