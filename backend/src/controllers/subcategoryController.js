import {
  getAllSubcategories,
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  toggleSubcategoryStatus,
  deleteSubcategory,
  getPublicSubcategories as getPublicSubcategoriesService,
} from "../services/subcategoryService.js";

// ==========================================
// GET ALL SUBCATEGORIES - ADMIN
// ==========================================

const getSubcategories = async (req, res) => {
  try {
    const { search = "", categoryId = "" } = req.query;

    const subcategories = await getAllSubcategories({
      search,
      categoryId,
    });

    res.status(200).json({
      success: true,
      message: "Subcategories fetched successfully",
      subcategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch subcategories",
    });
  }
};

// ==========================================
// GET SINGLE SUBCATEGORY - ADMIN
// ==========================================

const getSingleSubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;

    const subcategory = await getSubcategoryById(subcategoryId);

    res.status(200).json({
      success: true,
      message: "Subcategory fetched successfully",
      subcategory,
    });
  } catch (error) {
    const statusCode = error.message === "Subcategory not found" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch subcategory",
    });
  }
};

// ==========================================
// CREATE SUBCATEGORY - ADMIN
// ==========================================

const addSubcategory = async (req, res) => {
  try {
    const subcategory = await createSubcategory(req.body);

    res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      subcategory,
    });
  } catch (error) {
    const statusCode = error.message.includes("already exists") ? 409 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create subcategory",
    });
  }
};

// ==========================================
// UPDATE SUBCATEGORY - ADMIN
// ==========================================

const editSubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;

    const subcategory = await updateSubcategory(subcategoryId, req.body);

    res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      subcategory,
    });
  } catch (error) {
    const statusCode =
      error.message === "Subcategory not found"
        ? 404
        : error.message.includes("already exists")
          ? 409
          : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update subcategory",
    });
  }
};

// ==========================================
// TOGGLE SUBCATEGORY STATUS - ADMIN
// ==========================================

const toggleStatus = async (req, res) => {
  try {
    const { subcategoryId } = req.params;

    const subcategory = await toggleSubcategoryStatus(subcategoryId);

    res.status(200).json({
      success: true,
      message: "Subcategory status updated successfully",
      subcategory,
    });
  } catch (error) {
    const statusCode = error.message === "Subcategory not found" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update subcategory status",
    });
  }
};

// ==========================================
// DELETE SUBCATEGORY - ADMIN
// ==========================================

const removeSubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;

    await deleteSubcategory(subcategoryId);

    res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully",
    });
  } catch (error) {
    const statusCode = error.message === "Subcategory not found" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete subcategory",
    });
  }
};

// ==========================================
// GET PUBLIC SUBCATEGORIES - USER SHOP
// ==========================================

const getPublicSubcategories = async (req, res) => {
  try {
    const { categoryId = "" } = req.query;

    const subcategories = await getPublicSubcategoriesService({
      categoryId,
    });

    res.status(200).json({
      success: true,
      message: "Subcategories fetched successfully",
      subcategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch public subcategories",
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

export {
  getSubcategories,
  getSingleSubcategory,
  addSubcategory,
  editSubcategory,
  toggleStatus,
  removeSubcategory,
  getPublicSubcategories,
};
