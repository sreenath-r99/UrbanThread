import { useEffect, useState } from "react";

import {
  createCoupon,
  deleteCoupon,
  getCoupons,
  toggleCouponStatus,
  updateCoupon,
} from "../../services/couponService.js";

const emptyForm = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  maxDiscountAmount: "",
  expiryDate: "",
  usageLimit: "",
  isActive: true,
};

const formatPrice = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);

  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState(emptyForm);

  const [editingCoupon, setEditingCoupon] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);

  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const loadCoupons = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCoupons({
        search,
        includeInactive: true,
      });

      setCoupons(response?.coupons || []);
    } catch (error) {
      console.error("LOAD COUPONS ERROR:", error);

      setError(error?.response?.data?.message || "Unable to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCoupons();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);

    setEditingCoupon(null);

    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setFormLoading(true);

      setError("");
      setSuccess("");

      const payload = {
        code: formData.code,

        discountType: formData.discountType,

        discountValue: Number(formData.discountValue),

        minOrderAmount: Number(formData.minOrderAmount || 0),

        maxDiscountAmount:
          formData.discountType === "percentage"
            ? formData.maxDiscountAmount
              ? Number(formData.maxDiscountAmount)
              : null
            : null,

        expiryDate: formData.expiryDate,

        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,

        isActive: Boolean(formData.isActive),
      };

      if (editingCoupon) {
        await updateCoupon(editingCoupon._id, payload);

        setSuccess("Coupon updated successfully");
      } else {
        await createCoupon(payload);

        setSuccess("Coupon created successfully");
      }

      resetForm();

      await loadCoupons();
    } catch (error) {
      console.error("SAVE COUPON ERROR:", error);

      setError(error?.response?.data?.message || "Unable to save coupon");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (coupon) => {
    const date = new Date(coupon.expiryDate);

    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000,
    )
      .toISOString()
      .slice(0, 16);

    setEditingCoupon(coupon);

    setFormData({
      code: coupon.code || "",

      discountType: coupon.discountType || "percentage",

      discountValue: coupon.discountValue ?? "",

      minOrderAmount: coupon.minOrderAmount ?? "",

      maxDiscountAmount: coupon.maxDiscountAmount ?? "",

      expiryDate: localDate,

      usageLimit: coupon.usageLimit ?? "",

      isActive: coupon.isActive,
    });

    setShowForm(true);

    setError("");
    setSuccess("");
  };

  const handleToggle = async (couponId) => {
    try {
      setError("");
      setSuccess("");

      await toggleCouponStatus(couponId);

      setSuccess("Coupon status updated successfully");

      await loadCoupons();
    } catch (error) {
      setError(
        error?.response?.data?.message || "Unable to update coupon status",
      );
    }
  };

  const handleDelete = async (couponId) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this coupon?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteCoupon(couponId);

      setSuccess("Coupon deleted successfully");

      await loadCoupons();
    } catch (error) {
      setError(error?.response?.data?.message || "Unable to delete coupon");
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();

    await loadCoupons();
  };

  return (
    <div className="min-h-screen bg-[#111111] px-6 py-8 text-white lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col justify-between gap-5 border-b border-[#292929] pb-7 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600">
              Promotions
            </p>

            <h1 className="mt-3 font-serif text-4xl text-[#e8e3dc]">Coupons</h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
              Create and manage coupon codes used during checkout.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingCoupon(null);

              setFormData(emptyForm);

              setShowForm(true);

              setError("");
              setSuccess("");
            }}
            className="bg-white px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-black hover:bg-neutral-200"
          >
            Create Coupon
          </button>
        </div>

        {error && (
          <div className="mt-6 border border-red-900/50 bg-red-950/20 px-5 py-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 border border-emerald-900/50 bg-emerald-950/20 px-5 py-4 text-sm text-emerald-400">
            {success}
          </div>
        )}

        {showForm && (
          <section className="mt-8 border border-[#292929] bg-[#171717] p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-[#292929] pb-5">
              <div>
                <p className="text-[9px] uppercase tracking-[0.16em] text-neutral-600">
                  {editingCoupon ? "Edit" : "Create"}
                </p>

                <h2 className="mt-2 font-serif text-2xl text-[#e8e3dc]">
                  {editingCoupon ? "Edit Coupon" : "New Coupon"}
                </h2>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="text-[9px] uppercase tracking-[0.15em] text-neutral-500 hover:text-white"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-7">
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-[9px] uppercase tracking-[0.15em] text-neutral-600">
                    Coupon Code
                  </label>

                  <input
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    placeholder="SUMMER20"
                    className="mt-2 w-full border border-[#333333] bg-[#141414] px-4 py-3 text-sm uppercase tracking-wider text-white outline-none placeholder:text-neutral-700 focus:border-[#666666]"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-[0.15em] text-neutral-600">
                    Discount Type
                  </label>

                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleChange}
                    className="mt-2 w-full border border-[#333333] bg-[#141414] px-4 py-3 text-sm text-white outline-none"
                  >
                    <option value="percentage">Percentage</option>

                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-[0.15em] text-neutral-600">
                    Discount Value
                  </label>

                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    required
                    placeholder={
                      formData.discountType === "percentage" ? "20" : "500"
                    }
                    className="mt-2 w-full border border-[#333333] bg-[#141414] px-4 py-3 text-sm text-white outline-none focus:border-[#666666]"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-[0.15em] text-neutral-600">
                    Minimum Order Amount
                  </label>

                  <input
                    type="number"
                    name="minOrderAmount"
                    value={formData.minOrderAmount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="mt-2 w-full border border-[#333333] bg-[#141414] px-4 py-3 text-sm text-white outline-none focus:border-[#666666]"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-[0.15em] text-neutral-600">
                    Maximum Discount
                  </label>

                  <input
                    type="number"
                    name="maxDiscountAmount"
                    value={formData.maxDiscountAmount}
                    onChange={handleChange}
                    disabled={formData.discountType !== "percentage"}
                    min="0.01"
                    step="0.01"
                    placeholder="Optional"
                    className="mt-2 w-full border border-[#333333] bg-[#141414] px-4 py-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-30 focus:border-[#666666]"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-[0.15em] text-neutral-600">
                    Expiry Date
                  </label>

                  <input
                    type="datetime-local"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full border border-[#333333] bg-[#141414] px-4 py-3 text-sm text-white outline-none focus:border-[#666666]"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-[0.15em] text-neutral-600">
                    Usage Limit
                  </label>

                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleChange}
                    min="1"
                    step="1"
                    placeholder="Unlimited"
                    className="mt-2 w-full border border-[#333333] bg-[#141414] px-4 py-3 text-sm text-white outline-none focus:border-[#666666]"
                  />
                </div>

                <label className="flex items-center gap-3 self-end border border-[#333333] bg-[#141414] px-4 py-3">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        isActive: event.target.checked,
                      }))
                    }
                  />

                  <span className="text-sm text-neutral-300">
                    Active Coupon
                  </span>
                </label>
              </div>

              <div className="mt-7 flex gap-3">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-white px-6 py-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-black disabled:opacity-40"
                >
                  {formLoading
                    ? "Saving..."
                    : editingCoupon
                      ? "Update Coupon"
                      : "Create Coupon"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="border border-[#3a3a3a] px-6 py-3 text-[9px] uppercase tracking-[0.15em] text-neutral-400 hover:border-[#666666] hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="mt-8 border border-[#292929] bg-[#171717]">
          <div className="border-b border-[#292929] p-5 sm:p-6">
            <form
              onSubmit={handleSearch}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search coupon code..."
                className="flex-1 border border-[#333333] bg-[#141414] px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-[#666666]"
              />

              <button
                type="submit"
                className="bg-white px-6 py-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-black"
              >
                Search
              </button>
            </form>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-neutral-600">
              Loading coupons...
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-10 text-center text-sm text-neutral-600">
              No coupons found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-[#292929] text-left">
                    <th className="px-6 py-4 text-[9px] uppercase tracking-[0.15em] text-neutral-600">
                      Code
                    </th>

                    <th className="px-6 py-4 text-[9px] uppercase tracking-[0.15em] text-neutral-600">
                      Discount
                    </th>

                    <th className="px-6 py-4 text-[9px] uppercase tracking-[0.15em] text-neutral-600">
                      Minimum
                    </th>

                    <th className="px-6 py-4 text-[9px] uppercase tracking-[0.15em] text-neutral-600">
                      Expiry
                    </th>

                    <th className="px-6 py-4 text-[9px] uppercase tracking-[0.15em] text-neutral-600">
                      Usage
                    </th>

                    <th className="px-6 py-4 text-[9px] uppercase tracking-[0.15em] text-neutral-600">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-[9px] uppercase tracking-[0.15em] text-neutral-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {coupons.map((coupon) => {
                    const expired = new Date(coupon.expiryDate) <= new Date();

                    return (
                      <tr
                        key={coupon._id}
                        className="border-b border-[#252525] last:border-0"
                      >
                        <td className="px-6 py-5">
                          <p className="font-mono text-sm tracking-wider text-white">
                            {coupon.code}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm text-neutral-300">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}%`
                            : formatPrice(coupon.discountValue)}
                        </td>

                        <td className="px-6 py-5 text-sm text-neutral-500">
                          {coupon.minOrderAmount > 0
                            ? formatPrice(coupon.minOrderAmount)
                            : "None"}
                        </td>

                        <td className="px-6 py-5 text-sm text-neutral-500">
                          {new Date(coupon.expiryDate).toLocaleString("en-IN")}
                        </td>

                        <td className="px-6 py-5 text-sm text-neutral-500">
                          {coupon.usedCount}
                          {" / "}
                          {coupon.usageLimit ?? "∞"}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex border px-2 py-1 text-[8px] uppercase tracking-[0.12em] ${
                              coupon.isActive && !expired
                                ? "border-emerald-900/60 bg-emerald-950/30 text-emerald-400"
                                : "border-red-900/60 bg-red-950/30 text-red-400"
                            }`}
                          >
                            {expired
                              ? "Expired"
                              : coupon.isActive
                                ? "Active"
                                : "Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(coupon)}
                              className="border border-[#3a3a3a] px-3 py-2 text-[8px] uppercase tracking-[0.12em] text-neutral-400 hover:border-[#666666] hover:text-white"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggle(coupon._id)}
                              className="border border-[#3a3a3a] px-3 py-2 text-[8px] uppercase tracking-[0.12em] text-neutral-400 hover:border-[#666666] hover:text-white"
                            >
                              {coupon.isActive ? "Disable" : "Enable"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(coupon._id)}
                              className="border border-red-900/60 px-3 py-2 text-[8px] uppercase tracking-[0.12em] text-red-400 hover:border-red-500"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Coupons;
