import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Subcategory from "../models/SubCategory.js";

// ==========================
// GET ALL PRODUCTS
// ==========================

export const getAllProducts = async ({
  search = "",
  categoryId = "",
  subcategoryId = "",
} = {}) => {
  const query = {
    isDeleted: false,
  };

  if (search.trim()) {
    query.name = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  if (categoryId) {
    query.category = categoryId;
  }

  if (subcategoryId) {
    query.subcategory = subcategoryId;
  }

  const products = await Product.find(query)
    .populate("category", "name")
    .populate("subcategory", "name")
    .sort({ createdAt: -1 });

  return products;
};

// ==========================
// GET SINGLE PRODUCT
// ==========================

export const getProductById = async (productId) => {
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

// ==========================
// VALIDATE CATEGORY
// ==========================

const validateCategory = async (categoryId) => {
  const category = await Category.findOne({
    _id: categoryId,
    isDeleted: false,
    isActive: true,
  });

  if (!category) {
    throw new Error("Selected category not found or inactive");
  }

  return category;
};

// ==========================
// VALIDATE SUBCATEGORY
// ==========================

const validateSubcategory = async (
  subcategoryId,
  categoryId
) => {
  const subcategory = await Subcategory.findOne({
    _id: subcategoryId,
    category: categoryId,
    isDeleted: false,
    isActive: true,
  });

  if (!subcategory) {
    throw new Error(
      "Selected subcategory does not belong to the selected category"
    );
  }

  return subcategory;
};

// ==========================
// VALIDATE PRICE
// ==========================

const validatePrices = (price, discountPrice) => {
  if (price === undefined || price === null || price === "") {
    throw new Error("Product price is required");
  }

  if (Number(price) < 0) {
    throw new Error("Product price cannot be negative");
  }

  if (
    discountPrice !== undefined &&
    discountPrice !== null &&
    discountPrice !== ""
  ) {
    if (Number(discountPrice) < 0) {
      throw new Error("Discount price cannot be negative");
    }

    if (Number(discountPrice) > Number(price)) {
      throw new Error(
        "Discount price cannot be greater than regular price"
      );
    }
  }
};

// ==========================
// CREATE PRODUCT
// ==========================

export const createProduct = async (productData) => {
  const {
    name,
    description,
    category,
    subcategory,
    images = [],
    price,
    discountPrice,
    stock = 0,
    isActive = true,
  } = productData;

  if (!name || !name.trim()) {
    throw new Error("Product name is required");
  }

  if (!description || !description.trim()) {
    throw new Error("Product description is required");
  }

  if (!category) {
    throw new Error("Category is required");
  }

  if (!subcategory) {
    throw new Error("Subcategory is required");
  }

  if (!Array.isArray(images) || images.length === 0) {
    throw new Error("At least one product image is required");
  }

  await validateCategory(category);
  await validateSubcategory(subcategory, category);

  validatePrices(price, discountPrice);

  if (Number(stock) < 0) {
    throw new Error("Stock cannot be negative");
  }

  const existingProduct = await Product.findOne({
    name: {
      $regex: `^${name.trim()}$`,
      $options: "i",
    },
    isDeleted: false,
  });

  if (existingProduct) {
    throw new Error("A product with this name already exists");
  }

  const product = await Product.create({
    name: name.trim(),
    description: description.trim(),
    category,
    subcategory,
    images,
    price: Number(price),
    discountPrice:
      discountPrice === "" ||
      discountPrice === undefined ||
      discountPrice === null
        ? null
        : Number(discountPrice),
    stock: Number(stock),
    isActive,
  });

  return await Product.findById(product._id)
    .populate("category", "name")
    .populate("subcategory", "name");
};

// ==========================
// UPDATE PRODUCT
// ==========================

export const updateProduct = async (
  productId,
  productData
) => {
  const {
    name,
    description,
    category,
    subcategory,
    images,
    price,
    discountPrice,
    stock,
    isActive,
  } = productData;

  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (!name || !name.trim()) {
    throw new Error("Product name is required");
  }

  if (!description || !description.trim()) {
    throw new Error("Product description is required");
  }

  if (!category) {
    throw new Error("Category is required");
  }

  if (!subcategory) {
    throw new Error("Subcategory is required");
  }

  if (!Array.isArray(images) || images.length === 0) {
    throw new Error("At least one product image is required");
  }

  await validateCategory(category);
  await validateSubcategory(subcategory, category);

  validatePrices(price, discountPrice);

  if (Number(stock) < 0) {
    throw new Error("Stock cannot be negative");
  }

  const duplicateProduct = await Product.findOne({
    _id: { $ne: productId },
    name: {
      $regex: `^${name.trim()}$`,
      $options: "i",
    },
    isDeleted: false,
  });

  if (duplicateProduct) {
    throw new Error("A product with this name already exists");
  }

  product.name = name.trim();
  product.description = description.trim();
  product.category = category;
  product.subcategory = subcategory;
  product.images = images;
  product.price = Number(price);
  product.discountPrice =
    discountPrice === "" ||
    discountPrice === undefined ||
    discountPrice === null
      ? null
      : Number(discountPrice);
  product.stock = Number(stock);

  if (typeof isActive === "boolean") {
    product.isActive = isActive;
  }

  await product.save();

  return await Product.findById(product._id)
    .populate("category", "name")
    .populate("subcategory", "name");
};

// ==========================
// TOGGLE PRODUCT STATUS
// ==========================

export const toggleProductStatus = async (productId) => {
  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
  });

  if (!product) {
    throw new Error("Product not found");
  }

  product.isActive = !product.isActive;

  await product.save();

  return product;
};

// ==========================
// SOFT DELETE PRODUCT
// ==========================

export const deleteProduct = async (productId) => {
  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
  });

  if (!product) {
    throw new Error("Product not found");
  }

  product.isDeleted = true;
  product.isActive = false;

  await product.save();

  return product;
};