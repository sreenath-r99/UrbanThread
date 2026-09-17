import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createCategory } from "../../services/categoryService";

const AddCategory = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createCategory(formData);

      navigate("/admin/categories");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create category"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] px-6 py-8 text-white md:px-10">
      <div className="mb-8">
        <Link
          to="/admin/categories"
          className="text-sm text-gray-400 transition hover:text-white"
        >
          ← Back to Categories
        </Link>

        <h1 className="mt-5 text-3xl font-semibold">
          Add Category
        </h1>

        <p className="mt-2 text-sm text-gray-400">
          Create a new product category.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl rounded-xl border border-[#2c2c2c] bg-[#181818] p-6 md:p-8"
      >
        {error && (
          <div className="mb-6 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="mb-2 block text-sm text-gray-300">
            Category Name
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Example: Men"
            className="w-full rounded-lg border border-[#333333] bg-[#202020] px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-white"
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm text-gray-300">
            Description
          </label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter category description"
            rows="5"
            className="w-full resize-none rounded-lg border border-[#333333] bg-[#202020] px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-white"
          />
        </div>

        <div className="mb-8">
          <label className="mb-2 block text-sm text-gray-300">
            Image URL
          </label>

          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/category-image.jpg"
            className="w-full rounded-lg border border-[#333333] bg-[#202020] px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-white"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Category"}
          </button>

          <Link
            to="/admin/categories"
            className="rounded-lg border border-[#444444] px-6 py-3 text-center text-sm text-gray-300 transition hover:border-white hover:text-white"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AddCategory;