import mongoose from "mongoose";
import Category from "../models/Category.js";

/*
|--------------------------------------------------------------------------
| Get All Categories
|--------------------------------------------------------------------------
| Supports:
| - Search
| - Pagination
| - Sorting
| - Include inactive categories
|--------------------------------------------------------------------------
*/

const getAllCategories = async ({
  search = "",
  includeInactive = true,
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
} = {}) => {
  const filter = {
    isDeleted: false,
  };

  /*
  |--------------------------------------------------------------------------
  | Active / Inactive filter
  |--------------------------------------------------------------------------
  */

  if (!includeInactive) {
    filter.isActive = true;
  }

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const trimmedSearch = search.trim();

  if (trimmedSearch) {
    filter.name = {
      $regex: trimmedSearch,
      $options: "i",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const currentPage = Math.max(Number(page) || 1, 1);

  const itemsPerPage = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const skip = (currentPage - 1) * itemsPerPage;

  /*
  |--------------------------------------------------------------------------
  | Sorting
  |--------------------------------------------------------------------------
  */

  const allowedSortFields = ["createdAt", "updatedAt", "name"];

  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

  const safeSortOrder = sortOrder === "asc" ? 1 : -1;

  const sort = {
    [safeSortBy]: safeSortOrder,
  };

  /*
  |--------------------------------------------------------------------------
  | Fetch categories + total count
  |--------------------------------------------------------------------------
  */

  const [categories, totalCategories] = await Promise.all([
    Category.find(filter).sort(sort).skip(skip).limit(itemsPerPage),

    Category.countDocuments(filter),
  ]);

  /*
  |--------------------------------------------------------------------------
  | Pagination calculations
  |--------------------------------------------------------------------------
  */

  const totalPages = Math.ceil(totalCategories / itemsPerPage);

  return {
    categories,

    pagination: {
      currentPage,
      itemsPerPage,
      totalItems: totalCategories,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    },
  };
};

/*
|--------------------------------------------------------------------------
| Get Public Categories
|--------------------------------------------------------------------------
|
| Used by the User Side / Shop page.
|
| Only:
| - Non-deleted categories
| - Active categories
|
| No admin authentication is required.
|--------------------------------------------------------------------------
*/

const getPublicCategories = async () => {
  const categories = await Category.find({
    isDeleted: false,
    isActive: true,
  })
    .select("_id name image")
    .sort({ name: 1 })
    .lean();

  return categories;
};

/*
|--------------------------------------------------------------------------
| Get Single Category
|--------------------------------------------------------------------------
*/

const getCategoryById = async (categoryId) => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new Error("Invalid category ID");
  }

  const category = await Category.findOne({
    _id: categoryId,
    isDeleted: false,
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

/*
|--------------------------------------------------------------------------
| Create Category
|--------------------------------------------------------------------------
*/

const createCategory = async ({ name, description, image }) => {
  const trimmedName = name.trim();

  const existingCategory = await Category.findOne({
    name: trimmedName,
    isDeleted: false,
  });

  if (existingCategory) {
    throw new Error("Category already exists");
  }

  const category = await Category.create({
    name: trimmedName,
    description: description?.trim() || "",
    image: image || "",
  });

  return category;
};

/*
|--------------------------------------------------------------------------
| Update Category
|--------------------------------------------------------------------------
*/

const updateCategory = async (
  categoryId,
  { name, description, image, isActive },
) => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new Error("Invalid category ID");
  }

  const category = await Category.findOne({
    _id: categoryId,
    isDeleted: false,
  });

  if (!category) {
    throw new Error("Category not found");
  }

  /*
  |--------------------------------------------------------------------------
  | Name
  |--------------------------------------------------------------------------
  */

  if (
    name !== undefined &&
    name.trim().toLowerCase() !== category.name.toLowerCase()
  ) {
    const trimmedName = name.trim();

    const duplicateCategory = await Category.findOne({
      name: trimmedName,
      isDeleted: false,
      _id: {
        $ne: categoryId,
      },
    });

    if (duplicateCategory) {
      throw new Error("Another category with this name already exists");
    }

    category.name = trimmedName;
  }

  /*
  |--------------------------------------------------------------------------
  | Description
  |--------------------------------------------------------------------------
  */

  if (description !== undefined) {
    category.description = description.trim();
  }

  /*
  |--------------------------------------------------------------------------
  | Image
  |--------------------------------------------------------------------------
  */

  if (image !== undefined) {
    category.image = image;
  }

  /*
  |--------------------------------------------------------------------------
  | Active status
  |--------------------------------------------------------------------------
  */

  if (isActive !== undefined) {
    category.isActive = Boolean(isActive);
  }

  await category.save();

  return category;
};

/*
|--------------------------------------------------------------------------
| Soft Delete Category
|--------------------------------------------------------------------------
*/

const deleteCategory = async (categoryId) => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new Error("Invalid category ID");
  }

  const category = await Category.findOne({
    _id: categoryId,
    isDeleted: false,
  });

  if (!category) {
    throw new Error("Category not found");
  }

  category.isDeleted = true;
  category.isActive = false;

  await category.save();

  return category;
};

/*
|--------------------------------------------------------------------------
| Toggle Category Status
|--------------------------------------------------------------------------
*/

const toggleCategoryStatus = async (categoryId) => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new Error("Invalid category ID");
  }

  const category = await Category.findOne({
    _id: categoryId,
    isDeleted: false,
  });

  if (!category) {
    throw new Error("Category not found");
  }

  category.isActive = !category.isActive;

  await category.save();

  return category;
};

export {
  getAllCategories,
  getPublicCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
};
