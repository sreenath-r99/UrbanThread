import mongoose from "mongoose";

import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Subcategory from "../models/SubCategory.js";

const ALLOWED_SIZES = ["S", "M", "L", "XL", "XXL"];

/*
|--------------------------------------------------------------------------
| SIZE VALIDATION
|--------------------------------------------------------------------------
*/

const validateSizes = (sizes) => {
  if (!Array.isArray(sizes) || sizes.length === 0) {
    throw new Error("At least one product size is required");
  }

  const selectedSizes = new Set();

  const validatedSizes = sizes.map((item) => {
    if (!item || !item.size) {
      throw new Error("Product size is required");
    }

    const size = String(item.size)
      .trim()
      .toUpperCase();

    if (!ALLOWED_SIZES.includes(size)) {
      throw new Error(
        `Invalid size: ${size}. Allowed sizes are S, M, L, XL, XXL`
      );
    }

    if (selectedSizes.has(size)) {
      throw new Error(`Duplicate size is not allowed: ${size}`);
    }

    selectedSizes.add(size);

    const sizeStock = Number(item.stock);

    if (
      item.stock === undefined ||
      item.stock === null ||
      item.stock === "" ||
      !Number.isInteger(sizeStock) ||
      sizeStock < 0
    ) {
      throw new Error(`Invalid stock for size ${size}`);
    }

    return {
      size,
      stock: sizeStock,
    };
  });

  return validatedSizes;
};

/*
|--------------------------------------------------------------------------
| TOTAL STOCK
|--------------------------------------------------------------------------
*/

const calculateTotalStock = (sizes) => {
  return sizes.reduce(
    (total, item) => total + item.stock,
    0
  );
};

/*
|--------------------------------------------------------------------------
| GET ALL PRODUCTS - ADMIN
|--------------------------------------------------------------------------
*/

const getAllProducts = async ({
  search = "",
  categoryId = "",
  subcategoryId = "",
  includeInactive = true,
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
} = {}) => {
  const filter = {
    isDeleted: false,
  };

  if (!includeInactive) {
    filter.isActive = true;
  }

  if (search.trim()) {
    filter.name = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  if (
    categoryId &&
    mongoose.Types.ObjectId.isValid(categoryId)
  ) {
    filter.category = categoryId;
  }

  if (
    subcategoryId &&
    mongoose.Types.ObjectId.isValid(subcategoryId)
  ) {
    filter.subcategory = subcategoryId;
  }

  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "name",
    "price",
    "stock",
  ];

  const safeSortBy = allowedSortFields.includes(sortBy)
    ? sortBy
    : "createdAt";

  const safeSortOrder =
    sortOrder === "asc" ? 1 : -1;

  const safePage = Math.max(
    Number(page) || 1,
    1
  );

  const safeLimit = Math.min(
    Math.max(Number(limit) || 10, 1),
    100
  );

  const skip = (safePage - 1) * safeLimit;

  const [products, totalProducts] =
    await Promise.all([
      Product.find(filter)
        .populate("category", "name")
        .populate("subcategory", "name")
        .sort({
          [safeSortBy]: safeSortOrder,
        })
        .skip(skip)
        .limit(safeLimit),

      Product.countDocuments(filter),
    ]);

  return {
    products,

    pagination: {
      currentPage: safePage,
      totalPages: Math.ceil(
        totalProducts / safeLimit
      ),
      totalProducts,
      limit: safeLimit,
    },
  };
};

/*
|--------------------------------------------------------------------------
| GET SINGLE PRODUCT - ADMIN
|--------------------------------------------------------------------------
*/

const getProductById = async (productId) => {
  if (
    !mongoose.Types.ObjectId.isValid(productId)
  ) {
    throw new Error("Invalid product ID");
  }

  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
  })
    .populate("category", "name")
    .populate("subcategory", "name");

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};

/*
|--------------------------------------------------------------------------
| GET SINGLE PUBLIC PRODUCT - USER
|--------------------------------------------------------------------------
|
| Only active and non-deleted products can be viewed
| by normal users.
|
*/

const getPublicProductById = async (productId) => {
  if (
    !mongoose.Types.ObjectId.isValid(productId)
  ) {
    throw new Error("Invalid product ID");
  }

  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
    isActive: true,
  })
    .populate("category", "name")
    .populate("subcategory", "name")
    .lean();

  if (!product) {
    throw new Error(
      "Product is unavailable or no longer exists"
    );
  }

  return product;
};

/*
|--------------------------------------------------------------------------
| VALIDATE CATEGORY
|--------------------------------------------------------------------------
*/

const validateCategory = async (categoryId) => {
  if (
    !mongoose.Types.ObjectId.isValid(categoryId)
  ) {
    throw new Error("Invalid category");
  }

  const category = await Category.findOne({
    _id: categoryId,
    isDeleted: false,
    isActive: true,
  });

  if (!category) {
    throw new Error(
      "Category not found or inactive"
    );
  }

  return category;
};

/*
|--------------------------------------------------------------------------
| VALIDATE SUBCATEGORY
|--------------------------------------------------------------------------
*/

const validateSubcategory = async (
  subcategoryId,
  categoryId
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      subcategoryId
    )
  ) {
    throw new Error("Invalid subcategory");
  }

  const subcategory = await Subcategory.findOne({
    _id: subcategoryId,
    category: categoryId,
    isDeleted: false,
    isActive: true,
  });

  if (!subcategory) {
    throw new Error(
      "Subcategory not found, inactive, or does not belong to selected category"
    );
  }

  return subcategory;
};

/*
|--------------------------------------------------------------------------
| VALIDATE PRICE
|--------------------------------------------------------------------------
*/

const validatePrices = (
  price,
  discountPrice
) => {
  const numericPrice = Number(price);

  if (
    !Number.isFinite(numericPrice) ||
    numericPrice < 0
  ) {
    throw new Error(
      "Price must be a valid non-negative number"
    );
  }

  if (
    discountPrice !== null &&
    discountPrice !== undefined &&
    discountPrice !== ""
  ) {
    const numericDiscountPrice =
      Number(discountPrice);

    if (
      !Number.isFinite(
        numericDiscountPrice
      ) ||
      numericDiscountPrice < 0
    ) {
      throw new Error(
        "Discount price must be a valid non-negative number"
      );
    }

    if (
      numericDiscountPrice >= numericPrice
    ) {
      throw new Error(
        "Discount price must be less than the original price"
      );
    }
  }
};

/*
|--------------------------------------------------------------------------
| CREATE PRODUCT
|--------------------------------------------------------------------------
*/

const createProduct = async ({
  name,
  description,
  category,
  subcategory,
  images,
  price,
  discountPrice,
  sizes,
  isActive = true,
}) => {
  if (!name?.trim()) {
    throw new Error(
      "Product name is required"
    );
  }

  if (!description?.trim()) {
    throw new Error(
      "Product description is required"
    );
  }

  if (!category) {
    throw new Error(
      "Category is required"
    );
  }

  if (!subcategory) {
    throw new Error(
      "Subcategory is required"
    );
  }

  if (
    !images ||
    !Array.isArray(images) ||
    images.length < 3
  ) {
    throw new Error(
      "At least 3 product images are required"
    );
  }

  if (images.length > 5) {
    throw new Error(
      "Maximum 5 product images are allowed"
    );
  }

  await validateCategory(category);

  await validateSubcategory(
    subcategory,
    category
  );

  validatePrices(
    price,
    discountPrice
  );

  const validatedSizes =
    validateSizes(sizes);

  const totalStock =
    calculateTotalStock(
      validatedSizes
    );

  const existingProduct =
    await Product.findOne({
      name: name.trim(),
      isDeleted: false,
    });

  if (existingProduct) {
    throw new Error(
      "Product already exists"
    );
  }

  const product =
    await Product.create({
      name: name.trim(),

      description:
        description.trim(),

      category,

      subcategory,

      images,

      price,

      discountPrice:
        discountPrice === "" ||
        discountPrice === undefined
          ? null
          : Number(discountPrice),

      sizes: validatedSizes,

      stock: totalStock,

      isActive,
    });

  return await Product.findById(
    product._id
  )
    .populate("category", "name")
    .populate(
      "subcategory",
      "name"
    );
};

/*
|--------------------------------------------------------------------------
| UPDATE PRODUCT
|--------------------------------------------------------------------------
*/

const updateProduct = async (
  productId,
  {
    name,
    description,
    category,
    subcategory,
    images,
    price,
    discountPrice,
    sizes,
    isActive,
  }
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      productId
    )
  ) {
    throw new Error(
      "Invalid product ID"
    );
  }

  const product =
    await Product.findOne({
      _id: productId,
      isDeleted: false,
    });

  if (!product) {
    throw new Error(
      "Product not found"
    );
  }

  if (!name?.trim()) {
    throw new Error(
      "Product name is required"
    );
  }

  if (!description?.trim()) {
    throw new Error(
      "Product description is required"
    );
  }

  if (!category) {
    throw new Error(
      "Category is required"
    );
  }

  if (!subcategory) {
    throw new Error(
      "Subcategory is required"
    );
  }

  if (
    !images ||
    !Array.isArray(images) ||
    images.length < 3
  ) {
    throw new Error(
      "At least 3 product images are required"
    );
  }

  if (images.length > 5) {
    throw new Error(
      "Maximum 5 product images are allowed"
    );
  }

  await validateCategory(category);

  await validateSubcategory(
    subcategory,
    category
  );

  validatePrices(
    price,
    discountPrice
  );

  const validatedSizes =
    validateSizes(sizes);

  const totalStock =
    calculateTotalStock(
      validatedSizes
    );

  const duplicateProduct =
    await Product.findOne({
      name: name.trim(),
      isDeleted: false,
      _id: {
        $ne: productId,
      },
    });

  if (duplicateProduct) {
    throw new Error(
      "Another product with this name already exists"
    );
  }

  product.name =
    name.trim();

  product.description =
    description.trim();

  product.category =
    category;

  product.subcategory =
    subcategory;

  product.images =
    images;

  product.price =
    Number(price);

  product.discountPrice =
    discountPrice === "" ||
    discountPrice === undefined
      ? null
      : Number(discountPrice);

  product.sizes =
    validatedSizes;

  product.stock =
    totalStock;

  if (
    isActive !== undefined
  ) {
    product.isActive =
      isActive;
  }

  await product.save();

  return await Product.findById(
    product._id
  )
    .populate("category", "name")
    .populate(
      "subcategory",
      "name"
    );
};

/*
|--------------------------------------------------------------------------
| TOGGLE PRODUCT STATUS
|--------------------------------------------------------------------------
*/

const toggleProductStatus =
  async (productId) => {
    if (
      !mongoose.Types.ObjectId.isValid(
        productId
      )
    ) {
      throw new Error(
        "Invalid product ID"
      );
    }

    const product =
      await Product.findOne({
        _id: productId,
        isDeleted: false,
      });

    if (!product) {
      throw new Error(
        "Product not found"
      );
    }

    product.isActive =
      !product.isActive;

    await product.save();

    return product;
  };

/*
|--------------------------------------------------------------------------
| DELETE PRODUCT
|--------------------------------------------------------------------------
*/

const deleteProduct =
  async (productId) => {
    if (
      !mongoose.Types.ObjectId.isValid(
        productId
      )
    ) {
      throw new Error(
        "Invalid product ID"
      );
    }

    const product =
      await Product.findOne({
        _id: productId,
        isDeleted: false,
      });

    if (!product) {
      throw new Error(
        "Product not found"
      );
    }

    product.isDeleted =
      true;

    product.isActive =
      false;

    await product.save();

    return product;
  };

/*
|--------------------------------------------------------------------------
| GET PUBLIC PRODUCTS
|--------------------------------------------------------------------------
*/

const getPublicProducts = async ({
  search = "",
  categoryId = "",
  subcategoryId = "",
  minPrice = "",
  maxPrice = "",
  page = 1,
  limit = 12,
  sortBy = "createdAt",
  sortOrder = "desc",
} = {}) => {
  const filter = {
    isDeleted: false,
    isActive: true,
  };

  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  if (search.trim()) {
    filter.name = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | CATEGORY FILTER
  |--------------------------------------------------------------------------
  */

  if (
    categoryId &&
    mongoose.Types.ObjectId.isValid(categoryId)
  ) {
    filter.category = categoryId;
  }

  /*
  |--------------------------------------------------------------------------
  | SUBCATEGORY FILTER
  |--------------------------------------------------------------------------
  */

  if (
    subcategoryId &&
    mongoose.Types.ObjectId.isValid(subcategoryId)
  ) {
    filter.subcategory = subcategoryId;
  }

  /*
  |--------------------------------------------------------------------------
  | PRICE RANGE FILTER
  |--------------------------------------------------------------------------
  */

  const hasMinPrice =
    minPrice !== "" &&
    minPrice !== undefined &&
    minPrice !== null;

  const hasMaxPrice =
    maxPrice !== "" &&
    maxPrice !== undefined &&
    maxPrice !== null;

  if (hasMinPrice || hasMaxPrice) {
    const priceFilter = {};

    if (hasMinPrice) {
      const numericMinPrice =
        Number(minPrice);

      if (
        Number.isFinite(
          numericMinPrice
        ) &&
        numericMinPrice >= 0
      ) {
        priceFilter.$gte =
          numericMinPrice;
      }
    }

    if (hasMaxPrice) {
      const numericMaxPrice =
        Number(maxPrice);

      if (
        Number.isFinite(
          numericMaxPrice
        ) &&
        numericMaxPrice >= 0
      ) {
        priceFilter.$lte =
          numericMaxPrice;
      }
    }

    if (
      Object.keys(priceFilter).length > 0
    ) {
      filter.price = priceFilter;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | SORTING
  |--------------------------------------------------------------------------
  */

  const allowedSortFields = [
    "createdAt",
    "name",
    "price",
  ];

  const safeSortBy =
    allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

  const safeSortOrder =
    sortOrder === "asc" ? 1 : -1;

  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  const safePage = Math.max(
    Number(page) || 1,
    1
  );

  const safeLimit = Math.min(
    Math.max(Number(limit) || 12, 1),
    50
  );

  const skip =
    (safePage - 1) * safeLimit;

  /*
  |--------------------------------------------------------------------------
  | DATABASE QUERY
  |--------------------------------------------------------------------------
  */

  const [products, totalProducts] =
    await Promise.all([
      Product.find(filter)
        .populate("category", "name")
        .populate("subcategory", "name")
        .sort({
          [safeSortBy]: safeSortOrder,
        })
        .skip(skip)
        .limit(safeLimit)
        .lean(),

      Product.countDocuments(filter),
    ]);

  return {
    products,

    pagination: {
      currentPage: safePage,

      totalPages: Math.ceil(
        totalProducts / safeLimit
      ),

      totalProducts,

      limit: safeLimit,
    },
  };
};

/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

export {
  getAllProducts,
  getProductById,
  getPublicProductById,
  getPublicProducts,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
};