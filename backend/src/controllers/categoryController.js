import * as categoryService from "../services/categoryService.js";

const getCategories = async (req, res) => {
  try {
    const { search = "", includeInactive = "true" } = req.query;

    const categories = await categoryService.getAllCategories({
      search,
      includeInactive: includeInactive === "true",
    });

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch categories",
    });
  }
};

const getCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await categoryService.getCategoryById(categoryId);

    res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      category,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || "Category not found",
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const category = await categoryService.createCategory({
      name,
      description,
      image,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    const statusCode = error.message.includes("already exists") ? 409 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create category",
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, image, isActive } = req.body;

    const category = await categoryService.updateCategory(categoryId, {
      name,
      description,
      image,
      isActive,
    });

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    const statusCode = error.message === "Category not found" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update category",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    await categoryService.deleteCategory(categoryId);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    const statusCode = error.message === "Category not found" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete category",
    });
  }
};

const toggleCategoryStatus = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await categoryService.toggleCategoryStatus(categoryId);

    res.status(200).json({
      success: true,
      message: "Category status updated successfully",
      category,
    });
  } catch (error) {
    const statusCode = error.message === "Category not found" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update category status",
    });
  }
};

export {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
};