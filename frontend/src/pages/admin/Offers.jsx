
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getCategories } from "../../services/categoryService.js";

const API = axios.create({
  baseURL: "http://localhost:5000/api/admin",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const EMPTY_FORM = {
  name: "",
  description: "",
  offerType: "Product",
  product: "",
  category: "",
  discountType: "Percentage",
  discountValue: "",
  startDate: "",
  endDate: "",
  isActive: true,
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDiscount = (offer) => {
  if (offer.discountType === "Percentage") {
    return `${offer.discountValue}%`;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(offer.discountValue || 0);
};

const getOfferStatus = (offer) => {
  if (offer.isDeleted) return "Deleted";
  if (!offer.isActive) return "Inactive";

  const now = new Date();

  if (now < new Date(offer.startDate)) return "Scheduled";
  if (now > new Date(offer.endDate)) return "Expired";

  return "Active";
};

const statusStyles = {
  Active: "bg-green-500/10 text-green-400",
  Inactive: "bg-gray-500/10 text-gray-400",
  Scheduled: "bg-blue-500/10 text-blue-400",
  Expired: "bg-amber-500/10 text-amber-400",
  Deleted: "bg-red-500/10 text-red-400",
};

const toLocalDateTime = (date) => {
  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [actionId, setActionId] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/offers");
      const data = response.data;

      const fetchedOffers = Array.isArray(data)
        ? data
        : data.offers || data.data?.offers || [];

      setOffers(fetchedOffers);
    } catch (err) {
      console.error("Failed to fetch offers:", err);

      setError(
        err.response?.data?.message || "Failed to load offers.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await API.get("/products", {
        params: {
          page: 1,
          limit: 100,
          includeInactive: false,
        },
      });

      const data = response.data;

      setProducts(
        (Array.isArray(data) ? data : data.products || data.data?.products || [])
          .filter((product) => product.isActive && !product.isDeleted),
      );
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(
        err.response?.data?.message ||
          "Could not load products for the offer form.",
      );
    }
  }, []);

  const fetchCategoryOptions = useCallback(async () => {
    try {
      const data = await getCategories({
        page: 1,
        limit: 100,
        includeInactive: false,
      });

      setCategories(
        (data.categories || []).filter(
          (category) => category.isActive && !category.isDeleted,
        ),
      );
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError(
        err.response?.data?.message ||
          "Could not load categories for the offer form.",
      );
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const filteredOffers = useMemo(() => {
    if (activeTab === "All") return offers;

    return offers.filter(
      (offer) =>
        offer.offerType?.toLowerCase() === activeTab.toLowerCase(),
    );
  }, [offers, activeTab]);

  const activeCount = offers.filter(
    (offer) => getOfferStatus(offer) === "Active",
  ).length;

  const scheduledExpiredCount = offers.filter((offer) =>
    ["Scheduled", "Expired"].includes(getOfferStatus(offer)),
  ).length;

  const updateForm = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openCreateModal = async () => {
    setFormData({
      ...EMPTY_FORM,
      startDate: toLocalDateTime(new Date()),
      endDate: toLocalDateTime(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ),
    });

    setError("");
    setSuccess("");
    setShowModal(true);

    await Promise.all([fetchProducts(), fetchCategoryOptions()]);
  };

  const closeModal = () => {
    if (formLoading) return;

    setShowModal(false);
    setFormData(EMPTY_FORM);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setFormLoading(true);
      setError("");
      setSuccess("");

      if (!formData.name.trim()) {
        throw new Error("Offer name is required.");
      }

      const discountValue = Number(formData.discountValue);

      if (
        formData.discountValue === "" ||
        !Number.isFinite(discountValue) ||
        discountValue <= 0
      ) {
        throw new Error("Enter a valid discount greater than zero.");
      }

      if (
        formData.discountType === "Percentage" &&
        discountValue > 100
      ) {
        throw new Error("Percentage discount cannot exceed 100%.");
      }

      if (!formData.startDate || !formData.endDate) {
        throw new Error("Start date and end date are required.");
      }

      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime()) ||
        endDate <= startDate
      ) {
        throw new Error("End date must be later than start date.");
      }

      if (formData.offerType === "Product" && !formData.product) {
        throw new Error("Please select a product.");
      }

      if (formData.offerType === "Category" && !formData.category) {
        throw new Error("Please select a category.");
      }

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        offerType: formData.offerType,
        discountType: formData.discountType,
        discountValue,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isActive: formData.isActive,
      };

      if (formData.offerType === "Product") {
        payload.product = formData.product;
      } else {
        payload.category = formData.category;
      }

      await API.post("/offers", payload);

      setShowModal(false);
      setFormData(EMPTY_FORM);
      setSuccess("Offer created successfully.");

      await fetchOffers();
    } catch (err) {
      console.error("Offer creation failed:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create offer.",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (offer) => {
    const action = offer.isActive ? "deactivate" : "activate";

    if (
      !window.confirm(
        `Are you sure you want to ${action} "${offer.name}"?`,
      )
    ) {
      return;
    }

    try {
      setActionId(offer._id);
      setError("");
      setSuccess("");

      await API.patch(`/offers/${offer._id}/status`);

      setSuccess(`Offer ${action}d successfully.`);
      await fetchOffers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update offer status.",
      );
    } finally {
      setActionId("");
    }
  };

  const handleDelete = async (offer) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${offer.name}"?`,
      )
    ) {
      return;
    }

    try {
      setActionId(offer._id);
      setError("");
      setSuccess("");

      await API.delete(`/offers/${offer._id}`);

      setSuccess("Offer deleted successfully.");
      await fetchOffers();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete offer.",
      );
    } finally {
      setActionId("");
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] p-6 text-white md:p-8">
      {/* HEADER */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-gray-500">
            Promotions Management
          </p>

          <h1 className="text-3xl font-semibold">Offers</h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage product and category discounts.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-gray-200"
        >
          + Create Offer
        </button>
      </div>

      {/* MESSAGES */}
      {success && (
        <div className="mb-5 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-5 flex items-start justify-between gap-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
            className="text-red-300 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* SUMMARY */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-[#181818] p-5">
          <p className="text-sm text-gray-400">Total Offers</p>
          <h2 className="mt-3 text-3xl font-semibold">{offers.length}</h2>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#181818] p-5">
          <p className="text-sm text-gray-400">Active Offers</p>
          <h2 className="mt-3 text-3xl font-semibold">{activeCount}</h2>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#181818] p-5">
          <p className="text-sm text-gray-400">Scheduled / Expired</p>
          <h2 className="mt-3 text-3xl font-semibold">
            {scheduledExpiredCount}
          </h2>
        </div>
      </div>

      {/* FILTERS */}
      <div className="mb-5 flex flex-wrap gap-2">
        {["All", "Product", "Category"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm transition ${
              activeTab === tab
                ? "bg-white text-black"
                : "border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#181818]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-4 font-medium">Offer</th>
                <th className="px-5 py-4 font-medium">Type</th>
                <th className="px-5 py-4 font-medium">Discount</th>
                <th className="px-5 py-4 font-medium">Start Date</th>
                <th className="px-5 py-4 font-medium">End Date</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                    Loading offers...
                  </td>
                </tr>
              ) : filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                    No offers found.
                  </td>
                </tr>
              ) : (
                filteredOffers.map((offer) => {
                  const status = getOfferStatus(offer);
                  const busy = actionId === offer._id;

                  return (
                    <tr key={offer._id} className="transition hover:bg-white/[0.02]">
                      <td className="px-5 py-4">
                        <p className="font-medium text-white">{offer.name}</p>
                        <p className="mt-1 max-w-[240px] truncate text-xs text-gray-500">
                          {offer.description || "No description"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-gray-300">
                        {offer.offerType || "—"}
                      </td>

                      <td className="px-5 py-4 font-medium text-white">
                        {formatDiscount(offer)}
                        <p className="mt-1 text-xs text-gray-500">
                          {offer.discountType}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-gray-400">
                        {formatDate(offer.startDate)}
                      </td>

                      <td className="px-5 py-4 text-gray-400">
                        {formatDate(offer.endDate)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            statusStyles[status] ||
                            "bg-gray-500/10 text-gray-400"
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleToggleStatus(offer)}
                            className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-gray-300 transition hover:bg-white/5 disabled:opacity-40"
                          >
                            {busy
                              ? "Saving..."
                              : offer.isActive
                                ? "Deactivate"
                                : "Activate"}
                          </button>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleDelete(offer)}
                            className="rounded-md border border-red-500/20 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10 disabled:opacity-40"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REFRESH */}
      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={fetchOffers}
          disabled={loading}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
        >
          {loading ? "Loading..." : "Refresh Offers"}
        </button>
      </div>

      {/* CREATE OFFER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#181818] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold">Create Offer</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Create a product or category discount.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={formLoading}
                className="text-xl text-gray-500 hover:text-white disabled:opacity-40"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Offer Name *
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={updateForm}
                  required
                  maxLength={100}
                  placeholder="e.g. Weekend Special"
                  className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={updateForm}
                  rows={3}
                  maxLength={500}
                  placeholder="Describe this offer"
                  className="w-full resize-none rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Offer Type *
                </label>
                <select
                  name="offerType"
                  value={formData.offerType}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      offerType: event.target.value,
                      product: "",
                      category: "",
                    }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                >
                  <option value="Product">Product Offer</option>
                  <option value="Category">Category Offer</option>
                </select>
              </div>

              {formData.offerType === "Product" ? (
                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Product *
                  </label>
                  <select
                    name="product"
                    value={formData.product}
                    onChange={updateForm}
                    required
                    className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  {products.length === 0 && (
                    <p className="mt-2 text-xs text-amber-400">
                      No active products were returned by the API.
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={updateForm}
                    required
                    className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <p className="mt-2 text-xs text-amber-400">
                      No active categories were returned by the API.
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Discount Type *
                  </label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={updateForm}
                    className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={updateForm}
                    required
                    min="0.01"
                    max={formData.discountType === "Percentage" ? 100 : undefined}
                    step="0.01"
                    placeholder={
                      formData.discountType === "Percentage" ? "10" : "200"
                    }
                    className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={updateForm}
                    required
                    className="w-full rounded-lg border border-white/10 bg-[#111111] px-3 py-3 text-sm text-white outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={updateForm}
                    required
                    min={formData.startDate || undefined}
                    className="w-full rounded-lg border border-white/10 bg-[#111111] px-3 py-3 text-sm text-white outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm text-gray-300">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={updateForm}
                  className="h-4 w-4 accent-white"
                />
                Activate this offer immediately
              </label>

              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={formLoading}
                  className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {formLoading ? "Creating..." : "Create Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}