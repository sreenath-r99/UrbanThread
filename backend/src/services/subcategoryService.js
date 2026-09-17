import Subcategory from "../models/SubCategory.js";
import Category from "../models/Category.js";

// ==========================
// GET ALL SUBCATEGORIES
// ==========================

export const getAllSubcategories = async ({
  search = "",
  categoryId = "",
} = {}) => {
  const query = {
    isDeleted: false,
  };

  // Search by subcategory name
  if (search.trim()) {
    query.name = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  // Filter by parent category
  if (categoryId) {
    query.category = categoryId;
  }

  const subcategories = await Subcategory.find(query)
    .populate("category", "name")
    .sort({ createdAt: -1 });

  return subcategories;
};

// ==========================
// GET SINGLE SUBCATEGORY
// ==========================

export const getSubcategoryById = async (subcategoryId) => {
  const subcategory = await Subcategory.findOne({
    _id: subcategoryId,
    isDeleted: false,
  }).populate("category", "name");

  if (!subcategory) {
    throw new Error("Subcategory not found");
  }

  return subcategory;
};

// ==========================
// CREATE SUBCATEGORY
// ==========================

export const createSubcategory = async (subcategoryData) => {
  const {
    name,
    description = "",
    category,
    isActive = true,
  } = subcategoryData;

  if (!name || !name.trim()) {
    throw new Error("Subcategory name is required");
  }

  if (!category) {
    throw new Error("Parent category is required");
  }

  // Verify parent category
  const parentCategory = await Category.findOne({
    _id: category,
    isDeleted: false,
  });

  if (!parentCategory) {
    throw new Error("Parent category not found");
  }

  // Prevent duplicate name under the same category
  const existingSubcategory = await Subcategory.findOne({
    name: {
      $regex: `^${name.trim()}$`,
      $options: "i",
    },
    category,
    isDeleted: false,
  });

  if (existingSubcategory) {
    throw new Error(
      "This subcategory already exists under the selected category"
    );
  }

  const subcategory = await Subcategory.create({
    name: name.trim(),
    description: description.trim(),
    category,
    isActive,
  });

  return await Subcategory.findById(subcategory._id).populate(
    "category",
    "name"
  );
};

// ==========================
// UPDATE SUBCATEGORY
// ==========================

export const updateSubcategory = async (
  subcategoryId,
  subcategoryData
) => {
  const {
    name,
    description = "",
    category,
    isActive,
  } = subcategoryData;

  const subcategory = await Subcategory.findOne({
    _id: subcategoryId,
    isDeleted: false,
  });

  if (!subcategory) {
    throw new Error("Subcategory not found");
  }

  if (!name || !name.trim()) {
    throw new Error("Subcategory name is required");
  }

  if (!category) {
    throw new Error("Parent category is required");
  }

  // Verify parent category
  const parentCategory = await Category.findOne({
    _id: category,
    isDeleted: false,
  });

  if (!parentCategory) {
    throw new Error("Parent category not found");
  }

  // Check duplicate name, excluding current subcategory
  const duplicateSubcategory = await Subcategory.findOne({
    _id: { $ne: subcategoryId },
    name: {
      $regex: `^${name.trim()}$`,
      $options: "i",
    },
    category,
    isDeleted: false,
  });

  if (duplicateSubcategory) {
    throw new Error(
      "This subcategory already exists under the selected category"
    );
  }

  subcategory.name = name.trim();
  subcategory.description = description.trim();
  subcategory.category = category;

  if (typeof isActive === "boolean") {
    subcategory.isActive = isActive;
  }

  await subcategory.save();

  return await Subcategory.findById(subcategory._id).populate(
    "category",
    "name"
  );
};

// ==========================
// TOGGLE SUBCATEGORY STATUS
// ==========================

export const toggleSubcategoryStatus = async (subcategoryId) => {
  const subcategory = await Subcategory.findOne({
    _id: subcategoryId,
    isDeleted: false,
  });

  if (!subcategory) {
    throw new Error("Subcategory not found");
  }

  subcategory.isActive = !subcategory.isActive;

  await subcategory.save();

  return subcategory;
};

// ==========================
// SOFT DELETE SUBCATEGORY
// ==========================

export const deleteSubcategory = async (subcategoryId) => {
  const subcategory = await Subcategory.findOne({
    _id: subcategoryId,
    isDeleted: false,
  });

  if (!subcategory) {
    throw new Error("Subcategory not found");
  }

  subcategory.isDeleted = true;
  subcategory.isActive = false;

  await subcategory.save();

  return subcategory;
};