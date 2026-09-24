import { useCallback, useEffect, useState } from "react";

import Cropper from "react-easy-crop";

import {
  getProducts,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
} from "../../services/productService.js";

import { getCategories } from "../../services/categoryService.js";

import axios from "axios";

/*
|--------------------------------------------------------------------------
| IMAGE CROP / RESIZE HELPERS
|--------------------------------------------------------------------------
|
| Product images are cropped by the admin before upload.
| The final image is rendered at 1200 x 1500 pixels (4:5).
|
*/

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.addEventListener("load", () => {
      resolve(image);
    });

    image.addEventListener("error", (error) => {
      reject(error);
    });

    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

const getCroppedImageFile = async (imageSrc, pixelCrop, originalFileName) => {
  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  const outputWidth = 1200;
  const outputHeight = 1500;

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create image canvas");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.92);
  });

  if (!blob) {
    throw new Error("Failed to create cropped image");
  }

  const baseName = originalFileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-");

  return new File([blob], `${baseName}-cropped.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
};

/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| SIZE OPTIONS
|--------------------------------------------------------------------------
*/

const SIZE_OPTIONS = [
  {
    value: "S",
    label: "Small (S)",
  },
  {
    value: "M",
    label: "Medium (M)",
  },
  {
    value: "L",
    label: "Large (L)",
  },
  {
    value: "XL",
    label: "Extra Large (XL)",
  },
  {
    value: "XXL",
    label: "XXL",
  },
];

/*
|--------------------------------------------------------------------------
| CREATE EMPTY SIZES
|--------------------------------------------------------------------------
*/

const createEmptySizes = () => [
  {
    size: "S",
    stock: "",
    selected: false,
  },
  {
    size: "M",
    stock: "",
    selected: false,
  },
  {
    size: "L",
    stock: "",
    selected: false,
  },
  {
    size: "XL",
    stock: "",
    selected: false,
  },
  {
    size: "XXL",
    stock: "",
    selected: false,
  },
];

/*
|--------------------------------------------------------------------------
| CREATE EMPTY FORM
|--------------------------------------------------------------------------
*/

const createEmptyForm = () => ({
  name: "",
  description: "",
  category: "",
  subcategory: "",
  price: "",
  discountPrice: "",
  sizes: createEmptySizes(),
  isActive: true,
});

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

const Products = () => {
  const [products, setProducts] = useState([]);

  const [categories, setCategories] = useState([]);

  const [subcategories, setSubcategories] = useState([]);

  const [search, setSearch] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("");

  const [subcategoryFilter, setSubcategoryFilter] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalProducts: 0,
    limit: 10,
  });

  const [showModal, setShowModal] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState(createEmptyForm());

  const [selectedImageFiles, setSelectedImageFiles] = useState([]);

  const [imagePreviews, setImagePreviews] = useState([]);

  const [existingImages, setExistingImages] = useState([]);

  /*
  |--------------------------------------------------------------------------
  | IMAGE CROP STATE
  |--------------------------------------------------------------------------
  */

  const [cropQueue, setCropQueue] = useState([]);

  const [currentCropIndex, setCurrentCropIndex] = useState(0);

  const [cropImage, setCropImage] = useState("");

  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
  });

  const [zoom, setZoom] = useState(1);

  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [showCropModal, setShowCropModal] = useState(false);

  const [loading, setLoading] = useState(false);

  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /*
  |--------------------------------------------------------------------------
  | FETCH CATEGORIES
  |--------------------------------------------------------------------------
  */

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories("");

      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FETCH SUBCATEGORIES
  |--------------------------------------------------------------------------
  */

  const fetchSubcategories = async (categoryId = "") => {
    try {
      const response = await API.get("/subcategories", {
        params: {
          categoryId,
          includeInactive: true,
        },
      });

      setSubcategories(response.data.subcategories || []);
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);

      setSubcategories([]);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FETCH PRODUCTS
  |--------------------------------------------------------------------------
  */

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProducts({
        search,
        categoryId: categoryFilter,
        subcategoryId: subcategoryFilter,
        includeInactive: true,
        page,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      setProducts(data.products || []);

      setPagination(
        data.pagination || {
          currentPage: 1,
          totalPages: 0,
          totalProducts: 0,
          limit: 10,
        },
      );
    } catch (error) {
      console.error("Failed to fetch products:", error);

      setError(error.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, subcategoryFilter, page]);

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /*
  |--------------------------------------------------------------------------
  | CATEGORY CHANGE
  |--------------------------------------------------------------------------
  */

  const handleCategoryChange = async (value) => {
    setFormData((previous) => ({
      ...previous,
      category: value,
      subcategory: "",
    }));

    await fetchSubcategories(value);
  };

  /*
  |--------------------------------------------------------------------------
  | FILTER CATEGORY
  |--------------------------------------------------------------------------
  */

  const handleFilterCategoryChange = async (value) => {
    setCategoryFilter(value);
    setSubcategoryFilter("");
    setPage(1);

    await fetchSubcategories(value);
  };

  /*
  |--------------------------------------------------------------------------
  | FORM INPUT
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | SIZE TOGGLE
  |--------------------------------------------------------------------------
  */

  const handleSizeToggle = (size) => {
    setFormData((previous) => ({
      ...previous,
      sizes: previous.sizes.map((item) =>
        item.size === size
          ? {
              ...item,
              selected: !item.selected,
              stock: "",
            }
          : item,
      ),
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | SIZE STOCK
  |--------------------------------------------------------------------------
  */

  const handleSizeStockChange = (size, value) => {
    setFormData((previous) => ({
      ...previous,
      sizes: previous.sizes.map((item) =>
        item.size === size
          ? {
              ...item,
              stock: value,
            }
          : item,
      ),
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | TOTAL STOCK
  |--------------------------------------------------------------------------
  */

  const getTotalStock = () => {
    return formData.sizes.reduce((total, item) => {
      if (!item.selected) {
        return total;
      }

      return total + (Number(item.stock) || 0);
    }, 0);
  };

  /*
  |--------------------------------------------------------------------------
  | PREPARE SIZES
  |--------------------------------------------------------------------------
  */

  const prepareSizesForSubmit = () => {
    const selected = formData.sizes.filter((item) => item.selected);

    if (selected.length === 0) {
      throw new Error("Please select at least one product size");
    }

    return selected.map((item) => {
      if (
        item.stock === "" ||
        !Number.isInteger(Number(item.stock)) ||
        Number(item.stock) < 0
      ) {
        throw new Error(`Please enter valid stock for size ${item.size}`);
      }

      return {
        size: item.size,
        stock: Number(item.stock),
      };
    });
  };

  /*
  |--------------------------------------------------------------------------
  | IMAGE SELECTION
  |--------------------------------------------------------------------------
  */

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    const currentCount = existingImages.length + selectedImageFiles.length;

    const remaining = 5 - currentCount;

    if (remaining <= 0) {
      setError("Maximum 5 product images are allowed");
      event.target.value = "";
      return;
    }

    const filesToCrop = files.slice(0, remaining);

    for (const file of filesToCrop) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Only JPG, PNG, and WEBP images are allowed");
        event.target.value = "";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Each product image must be 5 MB or smaller");
        event.target.value = "";
        return;
      }
    }

    setError("");

    const firstFile = filesToCrop[0];
    const firstUrl = URL.createObjectURL(firstFile);

    setCropQueue(filesToCrop);
    setCurrentCropIndex(0);
    setCropImage(firstUrl);
    setCrop({
      x: 0,
      y: 0,
    });
    setZoom(1);
    setCroppedAreaPixels(null);
    setShowCropModal(true);

    event.target.value = "";
  };

  /*
  |--------------------------------------------------------------------------
  | CROP COMPLETE
  |--------------------------------------------------------------------------
  */

  const handleCropComplete = (_croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  };

  /*
  |--------------------------------------------------------------------------
  | APPLY CURRENT CROP
  |--------------------------------------------------------------------------
  */

  const handleApplyCrop = async () => {
    if (!cropImage || !croppedAreaPixels || !cropQueue[currentCropIndex]) {
      setError("Please wait for the image crop area to load");
      return;
    }

    try {
      setFormLoading(true);
      setError("");

      const originalFile = cropQueue[currentCropIndex];

      const croppedFile = await getCroppedImageFile(
        cropImage,
        croppedAreaPixels,
        originalFile.name,
      );

      const previewUrl = URL.createObjectURL(croppedFile);

      setSelectedImageFiles((previous) => [...previous, croppedFile]);

      setImagePreviews((previous) => [
        ...previous,
        {
          file: croppedFile,
          preview: previewUrl,
        },
      ]);

      URL.revokeObjectURL(cropImage);

      const nextIndex = currentCropIndex + 1;

      if (nextIndex < cropQueue.length) {
        const nextFile = cropQueue[nextIndex];
        const nextUrl = URL.createObjectURL(nextFile);

        setCurrentCropIndex(nextIndex);
        setCropImage(nextUrl);
        setCrop({
          x: 0,
          y: 0,
        });
        setZoom(1);
        setCroppedAreaPixels(null);
      } else {
        setCropQueue([]);
        setCurrentCropIndex(0);
        setCropImage("");
        setCroppedAreaPixels(null);
        setZoom(1);
        setShowCropModal(false);
      }
    } catch (error) {
      console.error("Image crop error:", error);

      setError(error.message || "Failed to crop image");
    } finally {
      setFormLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CANCEL CROP
  |--------------------------------------------------------------------------
  */

  const cancelCropProcess = () => {
    if (cropImage) {
      URL.revokeObjectURL(cropImage);
    }

    setCropQueue([]);
    setCurrentCropIndex(0);
    setCropImage("");
    setCroppedAreaPixels(null);
    setZoom(1);
    setShowCropModal(false);
  };

  /*
  |--------------------------------------------------------------------------
  | REMOVE NEW IMAGE
  |--------------------------------------------------------------------------
  */

  const removeNewImage = (index) => {
    setImagePreviews((previous) => {
      const image = previous[index];

      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }

      return previous.filter((_, imageIndex) => imageIndex !== index);
    });

    setSelectedImageFiles((previous) =>
      previous.filter((_, fileIndex) => fileIndex !== index),
    );
  };

  /*
  |--------------------------------------------------------------------------
  | REMOVE EXISTING IMAGE
  |--------------------------------------------------------------------------
  */

  const removeExistingImage = (index) => {
    setExistingImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  /*
  |--------------------------------------------------------------------------
  | RESET IMAGE STATE
  |--------------------------------------------------------------------------
  */

  const resetImages = () => {
    imagePreviews.forEach((item) => {
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });

    if (cropImage) {
      URL.revokeObjectURL(cropImage);
    }

    setSelectedImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);

    setCropQueue([]);
    setCurrentCropIndex(0);
    setCropImage("");
    setCroppedAreaPixels(null);
    setZoom(1);
    setShowCropModal(false);
  };

  /*
  |--------------------------------------------------------------------------
  | OPEN ADD MODAL
  |--------------------------------------------------------------------------
  */

  const openAddModal = () => {
    resetImages();

    setEditingProduct(null);

    setFormData(createEmptyForm());

    setSubcategories([]);

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  /*
  |--------------------------------------------------------------------------
  | OPEN EDIT MODAL
  |--------------------------------------------------------------------------
  */

  const openEditModal = async (product) => {
    resetImages();

    setEditingProduct(product);

    const productSizes = product.sizes || [];

    const sizes = createEmptySizes().map((item) => {
      const existing = productSizes.find(
        (sizeItem) => sizeItem.size === item.size,
      );

      return {
        size: item.size,
        stock: existing ? existing.stock : "",
        selected: Boolean(existing),
      };
    });

    setFormData({
      name: product.name || "",
      description: product.description || "",
      category: product.category?._id || "",
      subcategory: product.subcategory?._id || "",
      price: product.price ?? "",
      discountPrice: product.discountPrice ?? "",
      sizes,
      isActive: product.isActive,
    });

    setExistingImages(product.images || []);

    setError("");
    setSuccess("");

    await fetchSubcategories(product.category?._id || "");

    setShowModal(true);
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE MODAL
  |--------------------------------------------------------------------------
  */

  const closeModal = () => {
    if (formLoading) {
      return;
    }

    resetImages();

    setShowModal(false);
    setEditingProduct(null);
    setFormData(createEmptyForm());
    setSubcategories([]);
    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT PRODUCT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setFormLoading(true);
      setError("");
      setSuccess("");

      /*
        |--------------------------------------------------------------------------
        | BASIC VALIDATION
        |--------------------------------------------------------------------------
        */

      if (!formData.name.trim()) {
        throw new Error("Product name is required");
      }

      if (!formData.description.trim()) {
        throw new Error("Product description is required");
      }

      if (!formData.category) {
        throw new Error("Please select a category");
      }

      if (!formData.subcategory) {
        throw new Error("Please select a subcategory");
      }

      if (formData.price === "") {
        throw new Error("Price is required");
      }

      const price = Number(formData.price);

      if (!Number.isFinite(price) || price < 0) {
        throw new Error("Price must be a valid non-negative number");
      }

      /*
        |--------------------------------------------------------------------------
        | DISCOUNT
        |--------------------------------------------------------------------------
        */

      const discountPrice =
        formData.discountPrice === "" ? null : Number(formData.discountPrice);

      if (
        discountPrice !== null &&
        (!Number.isFinite(discountPrice) || discountPrice < 0)
      ) {
        throw new Error("Discount price must be a valid non-negative number");
      }

      if (discountPrice !== null && discountPrice >= price) {
        throw new Error("Discount price must be less than the original price");
      }

      /*
        |--------------------------------------------------------------------------
        | SIZES
        |--------------------------------------------------------------------------
        */

      const sizes = prepareSizesForSubmit();

      /*
        |--------------------------------------------------------------------------
        | IMAGE COUNT
        |--------------------------------------------------------------------------
        */

      const totalImageCount = existingImages.length + selectedImageFiles.length;

      if (totalImageCount < 3) {
        throw new Error("At least 3 product images are required");
      }

      if (totalImageCount > 5) {
        throw new Error("Maximum 5 product images are allowed");
      }

      /*
        |--------------------------------------------------------------------------
        | UPLOAD NEW IMAGES
        |--------------------------------------------------------------------------
        */

      let newUploadedImages = [];

      if (selectedImageFiles.length > 0) {
        const uploadResponse = await uploadProductImages(selectedImageFiles);

        newUploadedImages = uploadResponse.images || [];
      }

      /*
        |--------------------------------------------------------------------------
        | FINAL IMAGES
        |--------------------------------------------------------------------------
        */

      const finalImages = [...existingImages, ...newUploadedImages];

      if (finalImages.length < 3) {
        throw new Error("At least 3 product images are required");
      }

      /*
        |--------------------------------------------------------------------------
        | PRODUCT DATA
        |--------------------------------------------------------------------------
        */

      const productData = {
        name: formData.name.trim(),

        description: formData.description.trim(),

        category: formData.category,

        subcategory: formData.subcategory,

        images: finalImages,

        price,

        discountPrice,

        sizes,

        isActive: formData.isActive,
      };

      /*
        |--------------------------------------------------------------------------
        | CREATE
        |--------------------------------------------------------------------------
        */

      if (!editingProduct) {
        await createProduct(productData);

        setSuccess("Product created successfully");
      }

      /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */
      else {
        const oldImages = editingProduct.images || [];

        const removedImages = oldImages.filter(
          (oldImage) =>
            !existingImages.some(
              (currentImage) => currentImage.publicId === oldImage.publicId,
            ),
        );

        await updateProduct(editingProduct._id, productData);

        /*
          |--------------------------------------------------------------------------
          | DELETE REMOVED CLOUDINARY IMAGES
          |--------------------------------------------------------------------------
          */

        for (const image of removedImages) {
          if (image.publicId) {
            try {
              await deleteProductImage(image.publicId);
            } catch (deleteError) {
              console.error(
                "Failed to delete old Cloudinary image:",
                deleteError,
              );
            }
          }
        }

        setSuccess("Product updated successfully");
      }

      await fetchProducts();

      setTimeout(() => {
        closeModal();
      }, 700);
    } catch (error) {
      console.error("Product save error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to save product",
      );
    } finally {
      setFormLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | TOGGLE STATUS
  |--------------------------------------------------------------------------
  */

  const handleToggleStatus = async (product) => {
    const action = product.isActive ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${product.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await toggleProductStatus(product._id);

      setSuccess(`Product ${action}d successfully`);

      await fetchProducts();

      setTimeout(() => {
        setSuccess("");
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || `Failed to ${action} product`);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE PRODUCT
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProduct(product._id);

      setSuccess("Product deleted successfully");

      await fetchProducts();

      setTimeout(() => {
        setSuccess("");
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete product");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FORMAT PRICE
  |--------------------------------------------------------------------------
  */

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-[#111111] text-white p-6 md:p-8">
      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-gray-500">
            Inventory Management
          </p>

          <h1 className="text-3xl font-semibold">Products</h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your UrbanThread product catalog.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="bg-white text-black px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
        >
          + Add Product
        </button>
      </div>

      {/* SUCCESS */}

      {success && (
        <div className="mb-5 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {success}
        </div>
      )}

      {/* ERROR */}

      {error && !showModal && (
        <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* FILTER */}

      <div className="bg-[#181818] border border-white/10 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-white/30"
          />

          <select
            value={categoryFilter}
            onChange={(event) => handleFilterCategoryChange(event.target.value)}
            className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-300 outline-none focus:border-white/30"
          >
            <option value="">All Categories</option>

            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={subcategoryFilter}
            onChange={(event) => {
              setSubcategoryFilter(event.target.value);
              setPage(1);
            }}
            disabled={!categoryFilter}
            className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-300 outline-none focus:border-white/30 disabled:opacity-40"
          >
            <option value="">All Subcategories</option>

            {subcategories.map((subcategory) => (
              <option key={subcategory._id} value={subcategory._id}>
                {subcategory.name}
              </option>
            ))}
          </select>

          <div className="flex items-center px-4 py-2.5 rounded-lg bg-[#111111] border border-white/10 text-sm text-gray-400">
            Total Products:
            <span className="text-white ml-2 font-medium">
              {pagination.totalProducts}
            </span>
          </div>
        </div>
      </div>

      {/* TABLE */}

      <div className="bg-[#181818] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/10">
              <tr className="text-xs uppercase tracking-wider text-gray-500">
                <th className="px-5 py-4">Product</th>

                <th className="px-5 py-4">Category</th>

                <th className="px-5 py-4">Subcategory</th>

                <th className="px-5 py-4">Price</th>

                <th className="px-5 py-4">Sizes / Stock</th>

                <th className="px-5 py-4">Status</th>

                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-white/[0.02] transition"
                  >
                    {/* PRODUCT */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3 min-w-[230px]">
                        <div className="w-12 h-12 rounded-lg bg-[#222] border border-white/10 overflow-hidden flex-shrink-0">
                          {product.images?.[0]?.url ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">
                              No image
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-medium text-white">
                            {product.name}
                          </p>

                          <p className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-[220px]">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CATEGORY */}

                    <td className="px-5 py-4 text-sm text-gray-400">
                      {product.category?.name || "—"}
                    </td>

                    {/* SUBCATEGORY */}

                    <td className="px-5 py-4 text-sm text-gray-400">
                      {product.subcategory?.name || "—"}
                    </td>

                    {/* PRICE */}

                    <td className="px-5 py-4">
                      <div className="text-sm text-white">
                        {formatPrice(product.price)}
                      </div>

                      {product.discountPrice !== null &&
                        product.discountPrice !== undefined && (
                          <div className="text-xs text-green-400 mt-1">
                            {formatPrice(product.discountPrice)}
                          </div>
                        )}
                    </td>

                    {/* SIZES */}

                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        {product.sizes?.length > 0 ? (
                          product.sizes.map((sizeItem) => (
                            <div
                              key={sizeItem.size}
                              className="text-xs text-gray-400"
                            >
                              <span className="text-white font-medium">
                                {sizeItem.size}
                              </span>

                              {" : "}

                              {sizeItem.stock}
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-gray-600">
                            No sizes
                          </span>
                        )}

                        <div className="pt-1 text-xs font-medium text-gray-300">
                          Total: {product.stock}
                        </div>
                      </div>
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.isActive
                            ? "bg-green-500/10 text-green-400"
                            : "bg-gray-500/10 text-gray-500"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(product)}
                          className="px-3 py-1.5 rounded-md border border-white/10 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(product)}
                          className="px-3 py-1.5 rounded-md border border-white/10 text-xs text-gray-400 hover:bg-white/5 hover:text-white transition"
                        >
                          {product.isActive ? "Disable" : "Enable"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          className="px-3 py-1.5 rounded-md border border-red-500/20 text-xs text-red-400 hover:bg-red-500/10 transition"
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

      {/* PAGINATION */}

      {pagination.totalPages > 0 && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-sm text-gray-500">
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((previous) => Math.max(previous - 1, 1))}
              className="px-4 py-2 rounded-lg border border-white/10 text-sm text-gray-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() =>
                setPage((previous) =>
                  Math.min(previous + 1, pagination.totalPages),
                )
              }
              className="px-4 py-2 rounded-lg border border-white/10 text-sm text-gray-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* IMAGE CROP / RESIZE MODAL */}

      {showCropModal && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-[#181818] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* CROP HEADER */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Crop Product Image
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Image {currentCropIndex + 1} of {cropQueue.length} • Final
                  size: 1200 × 1500 px
                </p>
              </div>

              <button
                type="button"
                onClick={cancelCropProcess}
                disabled={formLoading}
                className="text-gray-500 hover:text-white text-xl disabled:opacity-40"
              >
                ×
              </button>
            </div>

            {/* CROP AREA */}

            <div className="p-6">
              <div className="relative w-full h-[420px] bg-black rounded-xl overflow-hidden">
                {cropImage && (
                  <Cropper
                    image={cropImage}
                    crop={crop}
                    zoom={zoom}
                    aspect={4 / 5}
                    minZoom={1}
                    maxZoom={3}
                    zoomWithScroll
                    cropShape="rect"
                    showGrid
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={handleCropComplete}
                  />
                )}
              </div>

              {/* ZOOM */}

              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-300">Zoom</label>

                  <span className="text-xs text-gray-500">
                    {zoom.toFixed(1)}x
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  className="w-full accent-white"
                />
              </div>

              <div className="mt-4 rounded-lg border border-white/10 bg-[#111111] px-4 py-3">
                <p className="text-xs text-gray-400">
                  Aspect ratio: <span className="text-white">4 : 5</span>
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  The cropped image will be resized to{" "}
                  <span className="text-gray-300">1200 × 1500 px</span> before
                  uploading to Cloudinary.
                </p>
              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 mt-5">
                <button
                  type="button"
                  onClick={cancelCropProcess}
                  disabled={formLoading}
                  className="px-5 py-2.5 rounded-lg border border-white/10 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleApplyCrop}
                  disabled={formLoading || !cropImage}
                  className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-gray-200 transition disabled:opacity-50"
                >
                  {formLoading
                    ? "Processing..."
                    : currentCropIndex + 1 < cropQueue.length
                      ? "Apply & Next"
                      : "Apply Image"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#181818] border border-white/10 rounded-2xl shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {editingProduct ? "Edit Product" : "Add Product"}
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  {editingProduct
                    ? "Update product information"
                    : "Add a new product to UrbanThread"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="text-gray-500 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* FORM ERROR */}

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* NAME */}

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Product Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-white/30"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Enter product description"
                  className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-white/30 resize-none"
                />
              </div>

              {/* CATEGORY */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Category
                  </label>

                  <select
                    value={formData.category}
                    onChange={(event) =>
                      handleCategoryChange(event.target.value)
                    }
                    className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-300 outline-none focus:border-white/30"
                  >
                    <option value="">Select Category</option>

                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SUBCATEGORY */}

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Subcategory
                  </label>

                  <select
                    value={formData.subcategory}
                    onChange={handleChange}
                    name="subcategory"
                    disabled={!formData.category}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-300 outline-none focus:border-white/30 disabled:opacity-40"
                  >
                    <option value="">Select Subcategory</option>

                    {subcategories.map((subcategory) => (
                      <option key={subcategory._id} value={subcategory._id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PRODUCT IMAGES */}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-300">
                    Product Images
                  </label>

                  <span className="text-xs text-gray-500">
                    {existingImages.length + selectedImageFiles.length} / 5
                  </span>
                </div>

                <label className="flex items-center justify-center w-full h-28 border border-dashed border-white/20 rounded-xl bg-[#111111] cursor-pointer hover:border-white/40 transition">
                  <div className="text-center">
                    <p className="text-sm text-gray-300">
                      Click to upload images
                    </p>

                    <p className="text-xs text-gray-600 mt-1">
                      Minimum 3 • Maximum 5
                    </p>

                    <p className="text-xs text-gray-600">
                      JPG, PNG, WEBP • 5 MB each
                    </p>
                  </div>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>

                {/* IMAGE GRID */}

                {(existingImages.length > 0 || imagePreviews.length > 0) && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                    {/* EXISTING */}

                    {existingImages.map((image, index) => (
                      <div
                        key={image.publicId || `existing-${index}`}
                        className="relative aspect-[4/5] rounded-lg overflow-hidden border border-white/10 bg-[#111111]"
                      >
                        <img
                          src={image.url}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/80 text-white hover:bg-red-600 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    {/* NEW */}

                    {imagePreviews.map((image, index) => (
                      <div
                        key={`${image.file.name}-${index}`}
                        className="relative aspect-[4/5] rounded-lg overflow-hidden border border-white/10 bg-[#111111]"
                      >
                        <img
                          src={image.preview}
                          alt={`New product ${index + 1}`}
                          className="w-full h-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/80 text-white hover:bg-red-600 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-600 mt-2">
                  At least 3 product images are required.
                </p>
              </div>

              {/* PRICE */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Price
                  </label>

                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    placeholder="1499"
                    className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Discount Price
                  </label>

                  <input
                    type="number"
                    name="discountPrice"
                    value={formData.discountPrice}
                    onChange={handleChange}
                    min="0"
                    placeholder="1199"
                    className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-white/30"
                  />
                </div>
              </div>

              {/* SIZES */}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-gray-300">
                    Available Sizes
                  </label>

                  <span className="text-sm text-gray-400">
                    Total Stock:{" "}
                    <span className="text-white font-medium">
                      {getTotalStock()}
                    </span>
                  </span>
                </div>

                <div className="space-y-3">
                  {SIZE_OPTIONS.map((sizeOption) => {
                    const sizeData = formData.sizes.find(
                      (item) => item.size === sizeOption.value,
                    );

                    return (
                      <div
                        key={sizeOption.value}
                        className={`flex items-center gap-4 rounded-lg border p-3 transition ${
                          sizeData?.selected
                            ? "border-white/20 bg-white/[0.03]"
                            : "border-white/10 bg-[#111111]"
                        }`}
                      >
                        <label className="flex items-center gap-3 flex-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sizeData?.selected || false}
                            onChange={() => handleSizeToggle(sizeOption.value)}
                            className="w-4 h-4 accent-white"
                          />

                          <span className="text-sm text-gray-300">
                            {sizeOption.label}
                          </span>
                        </label>

                        <input
                          type="number"
                          min="0"
                          disabled={!sizeData?.selected}
                          value={sizeData?.stock ?? ""}
                          onChange={(event) =>
                            handleSizeStockChange(
                              sizeOption.value,
                              event.target.value,
                            )
                          }
                          placeholder="Stock"
                          className="w-32 bg-[#0b0b0b] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/30 disabled:opacity-30"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ACTIVE */}

              <div className="flex items-center gap-3">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      isActive: event.target.checked,
                    }))
                  }
                  className="w-4 h-4 accent-white"
                />

                <label htmlFor="isActive" className="text-sm text-gray-300">
                  Product is active
                </label>
              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={formLoading}
                  className="px-5 py-2.5 rounded-lg border border-white/10 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-gray-200 transition disabled:opacity-50"
                >
                  {formLoading
                    ? "Saving..."
                    : editingProduct
                      ? "Update Product"
                      : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
