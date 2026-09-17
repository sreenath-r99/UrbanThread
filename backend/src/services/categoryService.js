import Category from "../models/Category.js";

const getAllCategories = async ({ search = "", includeInactive = true } = {}) => {
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

  return await Category.find(filter).sort({ createdAt: -1 });
};

const getCategoryById = async (categoryId) => {
  const category = await Category.findOne({
    _id: categoryId,
    isDeleted: false,
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

const createCategory = async ({ name, description, image }) => {
  const existingCategory = await Category.findOne({
    name: name.trim(),
    isDeleted: false,
  });

  if (existingCategory) {
    throw new Error("Category already exists");
  }

  const category = await Category.create({
    name: name.trim(),
    description: description?.trim() || "",
    image: image || "",
  });

  return category;
};

const updateCategory = async (
  categoryId,
  { name, description, image, isActive }
) => {
  const category = await Category.findOne({
    _id: categoryId,
    isDeleted: false,
  });

  if (!category) {
    throw new Error("Category not found");
  }

  if (name && name.trim().toLowerCase() !== category.name.toLowerCase()) {
    const duplicateCategory = await Category.findOne({
      name: name.trim(),
      isDeleted: false,
      _id: { $ne: categoryId },
    });

    if (duplicateCategory) {
      throw new Error("Another category with this name already exists");
    }

    category.name = name.trim();
  }

  if (description !== undefined) {
    category.description = description.trim();
  }

  if (image !== undefined) {
    category.image = image;
  }

  if (isActive !== undefined) {
    category.isActive = isActive;
  }

  await category.save();

  return category;
};

const deleteCategory = async (categoryId) => {
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

const toggleCategoryStatus = async (categoryId) => {
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
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
};