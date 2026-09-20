import * as categoryService from "../services/categoryService.js";

/*
|--------------------------------------------------------------------------
| Get Categories
|--------------------------------------------------------------------------
*/

const getCategories = async (req, res) => {
  try {
    const {
      search = "",
      includeInactive = "true",
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const result =
      await categoryService.getAllCategories({
        search,
        includeInactive:
          includeInactive === "true",

        page: Number(page),
        limit: Number(limit),

        sortBy,
        sortOrder,
      });

    res.status(200).json({
      success: true,
      message:
        "Categories fetched successfully",

      categories: result.categories,

      pagination: result.pagination,
    });
  } catch (error) {
    console.error(
      "Get categories error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch categories",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Public Categories
|--------------------------------------------------------------------------
|
| Used by the User Side / Shop page.
|--------------------------------------------------------------------------
*/

const getPublicCategories = async (
  req,
  res
) => {
  try {
    const categories =
      await categoryService.getPublicCategories();

    res.status(200).json({
      success: true,
      message:
        "Public categories fetched successfully",

      categories,
    });
  } catch (error) {
    console.error(
      "Get public categories error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch public categories",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Single Category
|--------------------------------------------------------------------------
*/

const getCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category =
      await categoryService.getCategoryById(
        categoryId
      );

    res.status(200).json({
      success: true,
      message:
        "Category fetched successfully",
      category,
    });
  } catch (error) {
    const statusCode =
      error.message ===
      "Category not found"
        ? 404
        : 400;

    res.status(statusCode).json({
      success: false,
      message:
        error.message ||
        "Category not found",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Create Category
|--------------------------------------------------------------------------
*/

const createCategory = async (req, res) => {
  try {
    const {
      name,
      description,
      image,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Category name is required",
      });
    }

    const category =
      await categoryService.createCategory({
        name,
        description,
        image,
      });

    res.status(201).json({
      success: true,
      message:
        "Category created successfully",
      category,
    });
  } catch (error) {
    const statusCode =
      error.message.includes(
        "already exists"
      )
        ? 409
        : 400;

    res.status(statusCode).json({
      success: false,
      message:
        error.message ||
        "Failed to create category",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Update Category
|--------------------------------------------------------------------------
*/

const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const {
      name,
      description,
      image,
      isActive,
    } = req.body;

    const category =
      await categoryService.updateCategory(
        categoryId,
        {
          name,
          description,
          image,
          isActive,
        }
      );

    res.status(200).json({
      success: true,
      message:
        "Category updated successfully",
      category,
    });
  } catch (error) {
    let statusCode = 400;

    if (
      error.message ===
      "Category not found"
    ) {
      statusCode = 404;
    }

    res.status(statusCode).json({
      success: false,
      message:
        error.message ||
        "Failed to update category",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Delete Category
|--------------------------------------------------------------------------
*/

const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    await categoryService.deleteCategory(
      categoryId
    );

    res.status(200).json({
      success: true,
      message:
        "Category deleted successfully",
    });
  } catch (error) {
    const statusCode =
      error.message ===
      "Category not found"
        ? 404
        : 400;

    res.status(statusCode).json({
      success: false,
      message:
        error.message ||
        "Failed to delete category",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Toggle Category Status
|--------------------------------------------------------------------------
*/

const toggleCategoryStatus = async (
  req,
  res
) => {
  try {
    const { categoryId } = req.params;

    const category =
      await categoryService.toggleCategoryStatus(
        categoryId
      );

    res.status(200).json({
      success: true,
      message:
        "Category status updated successfully",
      category,
    });
  } catch (error) {
    const statusCode =
      error.message ===
      "Category not found"
        ? 404
        : 400;

    res.status(statusCode).json({
      success: false,
      message:
        error.message ||
        "Failed to update category status",
    });
  }
};

export {
  getCategories,
  getPublicCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
};