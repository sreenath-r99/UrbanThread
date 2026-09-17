import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getCategory,
  updateCategory,
} from "../../services/categoryService";

const EditCategory = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await getCategory(categoryId);

        const category = response.category;

        setFormData({
          name: category.name || "",
          description: category.description || "",
          image: category.image || "",
          isActive: category.isActive,
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load category"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

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
      setSaving(true);
      setError("");

      await updateCategory(categoryId, formData);

      navigate("/admin/categories");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update category"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] px-6 py-10 text-center text-gray-400">
        Loading category...
      </div>
    );
  }

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
          Edit Category
        </h1>

        <p className="mt-2 text-sm text-gray-400">
          Update category information.
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
            className="w-full rounded-lg border border-[#333333] bg-[#202020] px-4 py-3 text-white outline-none focus:border-white"
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
            rows="5"
            className="w-full resize-none rounded-lg border border-[#333333] bg-[#202020] px-4 py-3 text-white outline-none focus:border-white"
          />
        </div>

        <div className="mb-6">
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

        <label className="mb-8 flex items-center gap-3 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(event) =>
              setFormData((previous) => ({
                ...previous,
                isActive: event.target.checked,
              }))
            }
            className="h-4 w-4"
          />

          Category is active
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
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

export default EditCategory;